import {Especeoiseau} from "../tables/Especeoiseau"

export interface UpdateKeyAndOtherFieldsRequest {
    oldKey: string;
    newKey: string;
    especeToUpdate: Especeoiseau;
    oldpredator: string | null;
    newpredator: string | null;
  }
  