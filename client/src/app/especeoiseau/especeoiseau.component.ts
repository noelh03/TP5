import { Component } from "@angular/core";
import { Especeoiseau, Statut  } from "../../../../common/tables/Especeoiseau";
import { CommunicationService } from "../communication.service";


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
  public nomScientifique: string = '';
  public nomCommun: string = '';
  public statut: Statut = Statut.Vulnerable; 
  public nomScientifiqueComsommer: string = '';


  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
    this.getEspecesOiseaux();
    this.getNomScientifiqueConsommer();
  }

  public getEspecesOiseaux(): void {
    this.communicationService.getEspecesOiseaux().subscribe((especesOiseaux: Especeoiseau[]) => {
      this.especesOiseaux = especesOiseaux;
    });
    
  }

  public getNomScientifiqueConsommer(): void {
    this.communicationService.getNomScientifiqueConsommer().subscribe((noms: string[]) => {
      this.listeNomsScientifiquesComsommer = noms;
    });
  }
  

  showAddForm(): void {
    this.showAddFormFlag = true;
  }

  closeAddForm(): void {
    this.showAddFormFlag = false;
  }
  

  public insertEspeceOiseau(): void {
    this.closeAddForm();
    const especeOiseau: Especeoiseau = {
      nomscientifique: this.nomScientifique,
      nomcommun: this.nomCommun,
      statutspeces: this.statut,
      nomscientifiquecomsommer: this.nomScientifiqueComsommer || 'NULL', 
    };
  
    this.communicationService.insertEspeceOiseau(especeOiseau).subscribe((res: number) => {
      if (res > 0) {
        this.communicationService.filter("update");
        this.refresh(); 
      }
      this.duplicateError = res === -1;
    });
  }
  
  private refresh() {
    this.getEspecesOiseaux();
    this.getNomScientifiqueConsommer(); 
    this.nomScientifique = "";
    this.nomCommun = "";
    this.statut = Statut.Vulnerable;
    this.nomScientifiqueComsommer = "";
  }
  
  public deleteEspeceOiseau(nomScientifique: string) {
    this.communicationService.deleteEspeceOiseau(nomScientifique).subscribe((res: any) => {
      this.refresh();
    });
  }

  public changeNomCommun(event: any, i: number) {
    const editField = event.target.textContent;
    this.especesOiseaux[i].nomcommun = editField;
  }

  public changeStatut(event: any, i: number) {
    const editField = event.target.textContent;
    this.especesOiseaux[i].statutspeces = editField;
  }

  public updateEspeceOiseau(i: number) {
    this.communicationService.updateEspeceOiseau(this.especesOiseaux[i]).subscribe((res: any) => {
      this.refresh();
    });
  }
}
