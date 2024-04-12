import { injectable } from "inversify";
import * as pg from "pg";
import "reflect-metadata";
import { Especeoiseau } from "../../../common/tables/Especeoiseau";
import {UpdateKeyAndOtherFieldsRequest} from "../../../common/tables/Keyobject";
import {UpdateKey} from "../../../common/tables/UpdateKey";
import {UpdatePredator} from "../../../common/tables/UpdatePredator";


@injectable()
export class DatabaseService {
  // TODO: A MODIFIER POUR VOTRE BD
  public connectionConfig: pg.ConnectionConfig = {
    user: "ornithologue_db",
    database: "bd_tp1",
    password: "1234",
    port: 5432,
    host: "127.0.0.1",
    keepAlive: true,
  };

  public pool: pg.Pool = new pg.Pool(this.connectionConfig);

  // ======= DEBUG =======
 // Récupérer toutes les espèces d'oiseaux depuis la base de données
 public async getAllBirds(): Promise<pg.QueryResult> {
  const client = await this.pool.connect();

  const res = await client.query("SELECT * FROM ornithologue_bd.Especeoiseau;");
  client.release();
  return res;
}

//A VOIR
public async getDistinctNomScientifiqueComsommer(): Promise<pg.QueryResult> {
  const client = await this.pool.connect();

  const queryText: string = " SELECT DISTINCT nomscientifique FROM ornithologue_bd.Especeoiseau;";
  const res = await client.query(queryText);
  client.release();
  return res;
}


public async createBird(bird: Especeoiseau): Promise<pg.QueryResult> {
  const client = await this.pool.connect();

  // Vérifier si la clé primaire existe déjà
  const keyExistsQueryText: string = `
    SELECT EXISTS (SELECT 1 FROM ornithologue_bd.Especeoiseau WHERE nomscientifique = $1);
  `;
  const keyExistsValues: any[] = [bird.nomscientifique];
  const keyExistsResult = await client.query(keyExistsQueryText, keyExistsValues);
  const keyExists = keyExistsResult.rows[0].exists;

  if (keyExists) {
    client.release();
    throw new Error("Une espèce avec cette clé existe déjà.");
  }

  if (!bird.nomscientifique || !bird.nomcommun || !bird.statutspeces) {
    client.release();
    throw new Error("Valeurs de création d'espèce non valides.");
  }

  const values: string[] = [
    bird.nomscientifique,
    bird.nomcommun,
    bird.statutspeces,
    bird.nomscientifiquecomsommer,
  ];
  const queryText: string =
    "INSERT INTO ornithologue_bd.Especeoiseau VALUES($1, $2, $3, $4);";

  const res = await client.query(queryText, values);
  client.release();
  return res;
}


  public async updateKey(request: UpdateKey): Promise<pg.QueryResult> {
    const client = await this.pool.connect();

    if (!request.especeToUpdate.nomscientifique || !request.especeToUpdate.nomcommun || !request.especeToUpdate.statutspeces)
      throw new Error("Invalid bird creation values");
        const updateKeyQueryText: string = `
            UPDATE ornithologue_bd.Especeoiseau
            SET nomscientifique = $1
            WHERE nomscientifique = $2;
        `;
        const updateKeyValues: any[] = [request.newKey, request.oldKey];
        await client.query(updateKeyQueryText, updateKeyValues);


        const updateOtherFieldsQueryText: string = `
            UPDATE ornithologue_bd.Especeoiseau
            SET nomcommun = $1,
                statutspeces = $2,
                nomscientifiquecomsommer = $3
            WHERE nomscientifique = $4;
        `;
        const updateOtherFieldsValues: any[] = [
          request.especeToUpdate.nomcommun,
          request.especeToUpdate.statutspeces,
          request.especeToUpdate.nomscientifiquecomsommer,
          request.newKey
        ];
        const res = await client.query(updateOtherFieldsQueryText, updateOtherFieldsValues);
        return res; 

}


public async updateKeyAndOtherFields(request: UpdateKeyAndOtherFieldsRequest): Promise<pg.QueryResult> {
  const client = await this.pool.connect();

  // Vérifiez si le nouveau nom du prédateur est différent de la nouvelle clé du nom d'espèce
  if (request.newpredator === request.newKey) {
    throw new Error("Le nouveau prédateur ne peut pas être le même que la nouvelle clé du nom d'espèce (pas de cannibalisme).");
  }

  // Mettez à jour la clé principale
  const updateKeyQueryText: string = `
    UPDATE ornithologue_bd.Especeoiseau
    SET nomscientifique = $1
    WHERE nomscientifique = $2;
  `;
  const updateKeyValues: any[] = [request.newKey, request.oldKey];
  await client.query(updateKeyQueryText, updateKeyValues);

  // Mettez à jour les autres champs
  const updateOtherFieldsQueryText: string = `
    UPDATE ornithologue_bd.Especeoiseau
    SET nomcommun = $1,
        statutspeces = $2,
        nomscientifiquecomsommer = $3
    WHERE nomscientifique = $4;
  `;
  const updateOtherFieldsValues: any[] = [
    request.especeToUpdate.nomcommun,
    request.especeToUpdate.statutspeces,
    request.especeToUpdate.nomscientifiquecomsommer,
    request.newKey
  ];
  const res = await client.query(updateOtherFieldsQueryText, updateOtherFieldsValues);

  // Mettre à jour le prédateur
  const updatePredatorQueryText: string = `
    UPDATE ornithologue_bd.Especeoiseau
    SET nomscientifiquecomsommer = $1
    WHERE nomscientifiquecomsommer = $2;
  `;
  const updatePredatorValues: any[] = [request.newpredator, request.oldpredator];
  await client.query(updatePredatorQueryText, updatePredatorValues);

  return res; // Renvoie un objet avec le nombre de lignes mises à jour
}


public async updatePredator(request: UpdatePredator): Promise<pg.QueryResult> {
  const client = await this.pool.connect();

  if (request.newpredator === request.especeToUpdate.nomscientifique) {
    throw new Error("Le nouveau prédateur ne peut pas être le même que la nouvelle clé du nom d'espèce (pas de cannibalisme).");
  }

  if (!request.especeToUpdate.nomscientifique || !request.especeToUpdate.nomcommun || !request.especeToUpdate.statutspeces)
    throw new Error("Invalid bird creation values");

    const updatepredatorandotherfieldstext: string = `
    UPDATE ornithologue_bd.Especeoiseau
    SET nomcommun = $1,
        statutspeces = $2,
        nomscientifiquecomsommer = $3
    WHERE nomscientifique = $4;
  `;
  const updatepredatorandotherfieldstextvalues: any[] = [
  request.especeToUpdate.nomcommun,
  request.especeToUpdate.statutspeces,
  request.newpredator,
  request.especeToUpdate.nomscientifique
  ];
  const res = await client.query(updatepredatorandotherfieldstext, updatepredatorandotherfieldstextvalues);
  return res;

}
  

  public async updateBird(bird: Especeoiseau): Promise<pg.QueryResult> {
    const client = await this.pool.connect();

    if (!bird.nomscientifique)
      throw new Error("Invalid bird update values");

    const values: string[] = [
      bird.nomcommun,
      bird.statutspeces,
      bird.nomscientifiquecomsommer,
      bird.nomscientifique,
    ];
    const queryText: string = `
      UPDATE ornithologue_bd.Especeoiseau 
      SET nomcommun = $1, statutspeces = $2, nomscientifiquecomsommer = $3 
      WHERE nomscientifique = $4;`;

    const res = await client.query(queryText, values);
    client.release();
    return res;
  }

  public async deleteBird(nomscientifique: string): Promise<pg.QueryResult> {
    const client = await this.pool.connect();

    if (!nomscientifique)
      throw new Error("Invalid bird delete values");

    const queryText: string = `
      DELETE FROM ornithologue_bd.Especeoiseau 
      WHERE nomscientifique = $1;`;

    const res = await client.query(queryText, [nomscientifique]);
    client.release();
    return res;
  }

 
}
