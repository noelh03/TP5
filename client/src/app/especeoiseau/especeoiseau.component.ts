import { Component, ElementRef, ViewChild } from "@angular/core";
import { Especeoiseau } from "../../../../common/tables/Especeoiseau";
import { CommunicationService } from "../communication.service";

@Component({
  selector: "app-especeoiseau",
  templateUrl: "./especeoiseau.component.html",
  styleUrls: ["./especeoiseau.component.css"],
})
export class EspeceOiseauComponent {
  @ViewChild("newNomScientifique") newNomScientifique: ElementRef;
  @ViewChild("newNomCommun") newNomCommun: ElementRef;
  @ViewChild("newStatut") newStatut: ElementRef;
  @ViewChild("newNomScientifiqueComsommer") newNomScientifiqueComsommer: ElementRef;

  public listeNomsScientifiquesComsommer: string[] = [];
  public especesOiseaux: Especeoiseau[] = [];
  public duplicateError: boolean = false;

  public constructor(private communicationService: CommunicationService) {}

  public ngOnInit(): void {
    this.getEspecesOiseaux();
  }

  public getEspecesOiseaux(): void {
    this.communicationService.getEspecesOiseaux().subscribe((especesOiseaux: Especeoiseau[]) => {
      this.especesOiseaux = especesOiseaux;
    });
    this.communicationService.getDistinctNomScientifique().subscribe((noms: string[]) => {
      this.listeNomsScientifiquesComsommer = noms;
    });
  }

  public insertEspeceOiseau(): void {
    const especeOiseau: Especeoiseau = {
      nomscientifique: this.newNomScientifique.nativeElement.innerText,
      nomcommun: this.newNomCommun.nativeElement.innerText,
      statutspeces: this.newStatut.nativeElement.innerText,
      nomscientifiquecomsommer: this.newNomScientifiqueComsommer.nativeElement.innerText,
    };

    this.communicationService.insertEspeceOiseau(especeOiseau).subscribe((res: number) => {
      if (res > 0) {
        this.communicationService.filter("update");
      }
      this.refresh();
      this.duplicateError = res === -1;
    });
  }

  private refresh() {
    this.getEspecesOiseaux();
    this.newNomScientifique.nativeElement.innerText = "";
    this.newNomCommun.nativeElement.innerText = "";
    this.newStatut.nativeElement.innerText = "";
    this.newNomScientifiqueComsommer.nativeElement.innerText = "";
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