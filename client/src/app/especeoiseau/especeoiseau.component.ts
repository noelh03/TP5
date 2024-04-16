import { Component } from "@angular/core";
import { Especeoiseau, Statut  } from "../../../../common/tables/Especeoiseau";
import {UpdateKeyAndOtherFieldsRequest} from "../../../../common/tables/Keyobject";
import { CommunicationService } from "../communication.service";
import {UpdateKey} from "../../../../common/tables/UpdateKey";
import {UpdatePredator} from "../../../../common/tables/UpdatePredator";

@Component({
  selector: "app-especeoiseau",
  templateUrl: "./especeoiseau.component.html",
  styleUrls: ["./especeoiseau.component.css"],
})
export class EspeceOiseauComponent { 

  public listeNomsScientifiquesComsommer: string[] = [];
  public especesOiseaux: Especeoiseau[] = [];
  public duplicateError: boolean = false;
  public showAddFormFlag: boolean = false;
  public selectedNomComsommer: string = '';
  public listeStatuts: Statut[] = Object.values(Statut);
  public selectedStatut: Statut = Statut.Vulnerable;
  public selectedpredator: string | null = '';
  public nomScientifique: string = 'Espèce';
  public nomCommun: string = 'Nom Espèce';
  public statut: Statut = Statut.Vulnerable; 
  public nomScientifiqueComsommer: string | null = null;
  public editable: boolean = false;
  public editing: boolean = false;
  public keymodified: boolean= false;
  public oldkey: string = '';
  public predatormodified: boolean = false;
  public oldpredator: string | null = '';
  public etat_1 : string = '';

  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
    this.getEspecesOiseaux();
    this.getNomScientifiqueConsommer();
  }

  public getEspecesOiseaux(): void {
    this.communicationService.getEspecesOiseaux().subscribe((especesOiseaux: Especeoiseau[]) => {
      this.especesOiseaux = especesOiseaux.map((espece) => {
        return { ...espece, editable: false }; 
      });
    });
  }
  
  public getNomScientifiqueConsommer(): void {
    this.communicationService.getNomScientifiqueConsommer().subscribe((noms: string[]) => {
      this.listeNomsScientifiquesComsommer = noms;
    });
  }
  
  public showAddForm(): void {
    this.nomScientifique = 'Espèce ' + this.generateRandomWord();
    this.nomCommun = 'Nom Espèce';
    this.selectedStatut = Statut.Vulnerable;
    this.nomScientifiqueComsommer = null;
    this.showAddFormFlag = true;
  }

  public closeAddForm(): void {
    this.showAddFormFlag = false;
  }
  
  public toggleEdit(index: number): void {
    this.editing = true;
    this.especesOiseaux.forEach((espece, i) => {
      espece.editable = i === index;
      this.editable = espece.editable;
      if( espece.editable)
      this.selectedpredator  = espece.nomscientifiquecomsommer;

    });
    this.selectedStatut = this.especesOiseaux[index].statutspeces;
    this.etat_1 = this.especesOiseaux[index].nomscientifique;
    this.selectedpredator = '';
  }

  public cancelEdit(index: number): void {
    this.editing = false;
    this.especesOiseaux[index].editable =false;
    this.especesOiseaux[index].nomscientifique = this.etat_1;
  }
  
  
  public insertEspeceOiseau(): void {
    this.closeAddForm();
    const especeOiseau: Especeoiseau = {
      nomscientifique: this.nomScientifique,
      nomcommun: this.nomCommun,
      statutspeces: this.statut,
      nomscientifiquecomsommer: this.nomScientifiqueComsommer, 
      editable: false,
    };
  
    this.communicationService.insertEspeceOiseau(especeOiseau).subscribe((res: number) => {
      if (res > 0) {
        this.refresh(); 
      }
      this.duplicateError = res === -1;
    });
  }
  
  private refresh(): void {
    this.getEspecesOiseaux();
    this.getNomScientifiqueConsommer(); 
    this.nomScientifique = 'Espèce';
    this.nomCommun = 'Nom Espèce';
    this.statut = Statut.Vulnerable;
    this.selectedStatut = Statut.Vulnerable;
    this.nomScientifiqueComsommer = 'Espèce sans prédateur';
    this.selectedpredator = 'Espèce sans prédateur';
  }
  
  public deleteEspeceOiseau(nomScientifique: string): void {
    this.communicationService.deleteEspeceOiseau(nomScientifique).subscribe((res: any) => {
      this.refresh();
    });
  }

  public changeNomCommun(event: any, i: number): void {
    const editField = event.target.textContent;
    this.especesOiseaux[i].nomcommun = editField;
  }

  public changeStatut(event: any, i: number, selectedStatut: Statut): void {
    this.especesOiseaux[i].statutspeces = selectedStatut;
  }


  public changeNomScientifiqueComsommer(event: any, i: number, selectedpredator: string): void {
    this.predatormodified = true;
    this.oldpredator = this.especesOiseaux[i].nomscientifiquecomsommer;
    this.especesOiseaux[i].nomscientifiquecomsommer = selectedpredator;
  }
  
  public updateEspeceOiseau(i: number): void {
    this.editing = false;
    if (this.keymodified && this.predatormodified) {
      this.updateKeyAndOtherFields(i);
      this.especesOiseaux[i].editable = false;
      return;
    } 
    else if(this.keymodified){
      this.updateKey(i);
      this.especesOiseaux[i].editable = false;
      return;
    }
    else if(this.predatormodified){
      this.updatePredator(i);
      this.especesOiseaux[i].editable = false;
      return;
    }
    else {
      this.communicationService.updateEspeceOiseau(this.especesOiseaux[i]).subscribe((res: any) => {
        this.toggleEdit(i);
        this.refresh();
        this.editing = false;},
        (error: any) => {
        console.error("Une erreur s'est produite lors de la mise à jour de l'espèce d'oiseau :", error);
        this.especesOiseaux[i].editable = true;
        this.editing = true;
        }
      );
    }
  }

  private updateKeyAndOtherFields(i: number): void {
    const request : UpdateKeyAndOtherFieldsRequest = {
      oldKey: this.oldkey,
      newKey: this.especesOiseaux[i].nomscientifique,
      especeToUpdate: this.especesOiseaux[i],
      oldpredator: this.oldpredator,
      newpredator:this.especesOiseaux[i].nomscientifiquecomsommer,
    };

    this.communicationService.updateKeyAndOtherFields( request).subscribe((res: any) => {
      this.keymodified = false;
      this.oldkey = '';
      this.predatormodified = false;
      this.oldpredator = '';
  

      this.toggleEdit(i);
      this.refresh();
      this.editing = false;},
      (error: any) => {
      console.error("Une erreur s'est produite lors de la mise à jour de l'espèce d'oiseau :", error);
      this.especesOiseaux[i].editable = true;
      this.editing = true;
      }
    );
  }

  private updateKey(i: number): void {
    const request : UpdateKey = {
      oldKey: this.oldkey,
      newKey: this.especesOiseaux[i].nomscientifique,
      especeToUpdate: this.especesOiseaux[i],

    };

    this.communicationService.updateKey( request).subscribe((res: any) => {
      this.keymodified = false;
      this.oldkey = '';
    
      this.toggleEdit(i);
      this.refresh();
      this.editing = false;},
      (error: any) => {
      console.error("Une erreur s'est produite lors de la mise à jour de l'espèce d'oiseau :", error);
      this.especesOiseaux[i].editable = true;
      this.editing = true;
      }
    );
  }

  private updatePredator(i: number): void {
    const request : UpdatePredator = {
      oldpredator: this.oldpredator,
      newpredator:this.especesOiseaux[i].nomscientifiquecomsommer,
      especeToUpdate: this.especesOiseaux[i],
    };

    this.communicationService.updatePredator(request).subscribe((res: any) => {
      this.predatormodified = false;
      this.oldpredator = '';
      
      this.toggleEdit(i);
      this.refresh();
      this.editing = false;},
      (error: any) => {
      console.error("Une erreur s'est produite lors de la mise à jour de l'espèce d'oiseau :", error);
      this.especesOiseaux[i].editable = true;
      this.editing = true;
      }
    );
  }

  private generateRandomWord(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    const length = 5;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  }
}
