import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchService } from './search.service';
import { Subscription } from 'rxjs';
import {debounceTime, delay, distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  public heroServerSideCtrl: FormControl = new FormControl();
  public fetchedHeros: any[] = [];
  public queryHero: FormControl = new FormControl()
  public queryHeroSubscription: Subscription;
  public searchServiceSubscription: Subscription;
  
  public _showRadialChart: boolean = false;
  public _showFavouriteTeamMembers: boolean = false;

  public heroIds: any = [];
  public favouriteHero: string[] = [];
  public heroSelections: string[] = [];

  constructor(private _searchService: SearchService) { }

  ngOnInit(): void {
    this.queryHeroSubscription = this.queryHero.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      delay(200)
    ).subscribe(queryHero => {
      if (queryHero.length){
        this.searchServiceSubscription = this._searchService.search(queryHero)
        .subscribe(response => this.processData(response))
      } else {
        this.fetchedHeros = [];
      }
    });
  }

  processData(res){
    this.fetchedHeros = [];
    if (res) {
      if (res.response == "success"){
        for (let index = 0; index < res.results.length; index++) {
          let hero = { heroName:res.results[index].name, 
                        heroId:res.results[index].id 
                      };
          this.fetchedHeros.push(hero);
        }
      }
    }
  }

  onClickCompare(){
    this.heroIds = this.heroServerSideCtrl.value;
    if (this.heroIds && this.heroIds.length){
      this._showRadialChart = true;
      this._showFavouriteTeamMembers = true;
    }
  }

  onClickReset(){
    this._showRadialChart = false;
    this.fetchedHeros = [];
    this.heroSelections = [];
    this.heroServerSideCtrl.setValue(this.heroSelections);
    if (!this.favouriteHero.length){
      this._showFavouriteTeamMembers = false;
    }
  }

  addToFavourite(heroName){
    if(this.favouriteHero.indexOf(heroName) === -1) {
      this.favouriteHero.push(heroName);
    }
  }

  cbHeroChanged(){
    if (this.heroServerSideCtrl.value.length < 5) {
      this.heroSelections = this.heroServerSideCtrl.value;
    } else {
      this.heroServerSideCtrl.setValue(this.heroSelections);
    }
  }
 
  ngOnDestroy(){
    this.queryHeroSubscription.unsubscribe();
    this.searchServiceSubscription.unsubscribe();
  }
}