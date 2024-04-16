import {Especeoiseau} from "../tables/Especeoiseau"

export interface UpdatePredator {
    oldpredator: string | null;
    newpredator: string | null;
    especeToUpdate: Especeoiseau;
  }
  