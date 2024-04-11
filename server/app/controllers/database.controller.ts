import { NextFunction, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import * as pg from "pg";

import { Especeoiseau } from "../../../common/tables/Especeoiseau";
import {UpdateKeyAndOtherFieldsRequest} from "../../../common/tables/Keyobject";
import {UpdateKey} from "../../../common/tables/UpdateKey";
import {UpdatePredator} from "../../../common/tables/UpdatePredator";

import { DatabaseService } from "../services/database.service";
import Types from "../types";

@injectable()
export class DatabaseController {
  public constructor(
    @inject(Types.DatabaseService) private databaseService: DatabaseService
  ) {}

  public get router(): Router {
    const router: Router = Router();

    // ======= Especeoiseau ROUTES =======
    // ex http://localhost:3000/database/hotel?hotelNb=3&name=LeGrandHotel&city=laval
  // ======= BIRDS ROUTES =======
  router.get("/birds", (req: Request, res: Response, _: NextFunction) => {
    this.databaseService.getAllBirds()
      .then((result: pg.QueryResult) => {
        res.json(result.rows); // Renvoie les espèces d'oiseaux récupérées sous forme de JSON
      })
      .catch((e: Error) => {
        console.error(e.stack);
        res.status(500).send("Une erreur s'est produite lors de la récupération des espèces d'oiseaux.");
      });
  });

  router.get("/birds/distinct-nomscientifique", (req: Request, res: Response, _: NextFunction) => {
    this.databaseService.getDistinctNomScientifiqueComsommer()
      .then((result: pg.QueryResult) => {
        res.json(result.rows); // Renvoie les noms scientifiques comsommer distincts sous forme de JSON
      })
      .catch((e: Error) => {
        console.error(e.stack);
        res.status(500).send("Une erreur s'est produite lors de la récupération des noms scientifiques comsommer distincts.");
      });
  });


    router.post(
      "/birds/insert",
      (req: Request, res: Response, _: NextFunction) => {
        const bird: Especeoiseau = {
          nomscientifique: req.body.nomscientifique,
          nomcommun: req.body.nomcommun,
          statutspeces: req.body.statutspeces,
          nomscientifiquecomsommer: req.body.nomscientifiquecomsommer,
          editable:false,
        };
    
        this.databaseService
          .createBird(bird)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
            res.json(-1);
          });
      }
    );


    router.put(
      "/birds/updateKeyAndOtherFields",
      (req: Request, res: Response, _: NextFunction) => {
        const request: UpdateKeyAndOtherFieldsRequest = {
          oldKey: req.body.oldKey,
          newKey: req.body.newKey,
          especeToUpdate: req.body.especeToUpdate,
          oldpredator: req.body.oldpredator,
          newpredator: req.body.newpredator,
        };
    
        this.databaseService
          .updateKeyAndOtherFields(request)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
            res.json(-1);
          });
      }
    );

    router.put(
      "/birds/updateKey",
      (req: Request, res: Response, _: NextFunction) => {
        const request: UpdateKey = {
          oldKey: req.body.oldKey,
          newKey: req.body.newKey,
          especeToUpdate: req.body.especeToUpdate,
        };
    
        this.databaseService
          .updateKey(request)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
            res.json(-1);
          });
      }
    );

    router.put(
      "/birds/updatePredator",
      (req: Request, res: Response, _: NextFunction) => {
        const request: UpdatePredator = {
          oldpredator: req.body.oldpredator,
          newpredator: req.body.newpredator,
          especeToUpdate: req.body.especeToUpdate,
        };
    
        this.databaseService
          .updatePredator(request)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
            res.json(-1);
          });
      }
    );
    

    router.put(
      "/birds/update",
      (req: Request, res: Response, _: NextFunction) => {
        const bird: Especeoiseau = {
          nomscientifique: req.body.nomscientifique,
          nomcommun: req.body.nomcommun,
          statutspeces: req.body.statutspeces,
          nomscientifiquecomsommer: req.body.nomscientifiquecomsommer,
          editable:false,
        };
    
        this.databaseService
          .updateBird(bird)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
            res.json(-1);
          });
      }
    );


    
    router.delete(
      "/birds/delete/:nomscientifique",
      (req: Request, res: Response, _: NextFunction) => {
        const nomscientifique: string = req.params.nomscientifique;
    
        this.databaseService
          .deleteBird(nomscientifique)
          .then((result: pg.QueryResult) => {
            res.json(result.rowCount);
          })
          .catch((e: Error) => {
            console.error(e.stack);
            res.json(-1);
          });
      }
    );
    
    

    return router;
  }
}
