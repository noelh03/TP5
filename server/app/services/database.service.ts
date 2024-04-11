import { injectable } from "inversify";
import * as pg from "pg";
import "reflect-metadata";
import { Especeoiseau } from "../../../common/tables/Especeoiseau";

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

public async getDistinctNomScientifiqueComsommer(): Promise<pg.QueryResult> {
  const client = await this.pool.connect();

  const queryText: string = " SELECT DISTINCT nomscientifique FROM ornithologue_bd.Especeoiseau;";
  const res = await client.query(queryText);
  client.release();
  return res;
}


public async createBird(bird: Especeoiseau): Promise<pg.QueryResult> {
    const client = await this.pool.connect();

    if (!bird.nomscientifique || !bird.nomcommun || !bird.statutspeces)
      throw new Error("Invalid bird creation values");

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
