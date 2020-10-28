import { Component, Input, OnInit, Inject, NgZone, PLATFORM_ID, OnChanges, OnDestroy } from '@angular/core';
import { SearchService } from '../search.service';

import { isPlatformBrowser } from '@angular/common';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-radialchart',
  templateUrl: './radialchart.component.html',
  styleUrls: ['./radialchart.component.css']
})
export class RadialchartComponent implements OnInit, OnChanges, OnDestroy {

  @Input() heroIds: any;

  private _powerStatsDataArr = [{
      powertype:"intelligence"
    },{
      powertype:"strength"
    },{
      powertype:"speed"
    },{
      powertype:"durability"
    },{
      powertype:"power"
    },{
      powertype:"combat"
    }
  ];

  private _herosPowerStats: any;

  private chart: am4charts.RadarChart;

  private _searchServiceSubsriptions:Array<Subscription> = []

  constructor(private _searchService: SearchService, @Inject(PLATFORM_ID) private platformId, private zone: NgZone) { }

  ngOnChanges(){
    if (this.heroIds){
      this._herosPowerStats = [];
      for (let index = 0; index < this.heroIds.length; index++) {
        this._searchServiceSubsriptions.push(this._searchService.getPowerstats(this.heroIds[index].heroId)
        .subscribe(response => {
          this._herosPowerStats.push(response);
          this.showChart();
        }));
      }
    }
  }

  ngOnInit(): void {
    if (this.heroIds){
      this._herosPowerStats = [];
      for (let index = 0; index < this.heroIds.length; index++) {
        this._searchService.getPowerstats(this.heroIds[index].heroId)
        .subscribe(response => {
          this._herosPowerStats.push(response);
          this.showChart();
        });
      }
    }
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  showChart(){
    if (this.heroIds.length != this._herosPowerStats.length)
      return;

    for (let heroIndex = 0; heroIndex < this._herosPowerStats.length; heroIndex++){
      for (let index = 0; index < this._powerStatsDataArr.length; index++) {
        this._powerStatsDataArr[index]["value" + heroIndex] = this._herosPowerStats[heroIndex][this._powerStatsDataArr[index].powertype];
      }
    }
    
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);

      let chart = am4core.create("chartdiv", am4charts.RadarChart);

      chart.paddingRight = 20;
      chart.data = this._powerStatsDataArr;
      
      let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis<am4charts.AxisRendererCircular>());
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.dataFields.category = "powertype";

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererRadial>());
      
      for (let index = 0 ; index < this._herosPowerStats.length; index++){
        let series = chart.series.push(new am4charts.RadarSeries());
        series.dataFields.valueY = "value"+index;
        series.dataFields.categoryX = "powertype";
        series.tooltipText = "{valueY}";
        series.name = this._herosPowerStats[index].name;
        series.strokeWidth = 3;
        series.bullets.create(am4charts.CircleBullet);
      }
      
      chart.cursor = new am4charts.RadarCursor();
      chart.legend = new am4charts.Legend();

      this.chart = chart;
    });
  }

  ngOnDestroy() {
    // Clean up chart when the component is removed
    this.browserOnly(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
    for (let index = 0; index < this._searchServiceSubsriptions.length; index++) {
      this._searchServiceSubsriptions[index].unsubscribe();
    }
  }

}
