import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private _tokenId:string = "3808993905777684";
  private _baseUrl:string = "https://www.superheroapi.com/api.php/" + this._tokenId
  
  constructor(private _httpClient:HttpClient) { }

  search(queryString: string){
    let _URL = this._baseUrl + "/search/" + queryString;
    return this._httpClient.get<any>(_URL);
  }

  getPowerstats(id: string){
    let _URL = this._baseUrl + "/" +id + "/powerstats";
    return this._httpClient.get<any>(_URL);
  } 
}