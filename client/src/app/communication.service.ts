import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
// tslint:disable-next-line:ordered-imports
import { of, Observable, Subject } from "rxjs";
import { catchError } from "rxjs/operators";
import { Especeoiseau } from "../../../common/tables/Especeoiseau";

@Injectable()
export class CommunicationService {
  private readonly BASE_URL: string = "http://localhost:3000/database";
  public constructor(private http: HttpClient) {}

  private _listners: any = new Subject<any>();

  public listen(): Observable<any> {
    return this._listners.asObservable();
  }

  public filter(filterBy: string): void {
    this._listners.next(filterBy);
  }

  public getEspecesOiseaux(): Observable<Especeoiseau[]> {
    return this.http
      .get<Especeoiseau[]>(this.BASE_URL + "/birds")
      .pipe(catchError(this.handleError<Especeoiseau[]>("getEspecesOiseaux")));
  }

  public insertEspeceOiseau(espece: Especeoiseau): Observable<number> {
    return this.http
      .post<number>(this.BASE_URL + "/birds/insert", espece)
      .pipe(catchError(this.handleError<number>("insertEspeceOiseau")));
  }

  public updateEspeceOiseau(espece: Especeoiseau): Observable<number> {
    return this.http
      .put<number>(this.BASE_URL + "/birds/update", espece)
      .pipe(catchError(this.handleError<number>("updateEspeceOiseau")));
  }

  public deleteEspeceOiseau(nomscientifique: string): Observable<number> {
    return this.http
      .delete<number>(this.BASE_URL + `/birds/delete/${nomscientifique}`)
      .pipe(catchError(this.handleError<number>("deleteEspeceOiseau")));
  }

  public getDistinctNomScientifique(): Observable<string[]> {
    return this.http
      .get<string[]>(this.BASE_URL + "/birds/distinct-nomscientifique")
      .pipe(catchError(this.handleError<string[]>("getDistinctNomScientifique")));
  }
  

  private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
    return (error: Error): Observable<T> => {
      console.error("Error occurred:", error);
      return of(result as T);
    };
  }
}
