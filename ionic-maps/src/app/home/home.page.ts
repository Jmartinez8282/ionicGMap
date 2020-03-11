import { Component, ViewChild, ElementRef,} from '@angular/core';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map',{static:false})
  mapElement: ElementRef;
  map:any;
currentMapTrack = null;
isTracking = false;
trackedRoute =[];
previousTracks =[];
positionSubscription:Subscription
  constructor(public NavCtrl:NavController,private plt:Platform,private geolocation:Geolocation,private storage:Storage,private alertCtrl:AlertController) {

  }
  ionViewDidLoad(){
    this.plt.ready().then(()=>{
      this.loadHistoricRoutes();
    let mapOptions = {
      zoom: 13,
      mapTypeId: google.maps.mapTypeId.ROADMAP,
      mapTypeControl:false,
      streeViewControl:false,
      fullScreenControl:false,

    };
    this.map = new google.maps.Map(this.mapElement.nativeElement,mapOptions);
    this.geolocation.getCurrentPosition().then(pos => {
      let latLng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
      this.map.setCenter(latLng);
      this.map.setZoom(15);
    })
    });
  }
  loadHistoricRoutes(){
    this.storage.get('routes').then(data =>{
      if (data){
        this.previousTracks = data;
      }
    });
  }
  
}
