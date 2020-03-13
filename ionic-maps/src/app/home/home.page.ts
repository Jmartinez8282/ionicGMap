import { Component, ViewChild, ElementRef,} from '@angular/core';
import { NavController, Platform, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import {filter} from 'rxjs/operators';
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('map',{static:false})mapElement: ElementRef;
  
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
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl:false,
      streeViewControl:false,
      fullScreenControl:false,

    };
    this.map = new google.maps.Map(this.mapElement.nativeElement,mapOptions);
    this.geolocation.getCurrentPosition().then(pos => {
      let latLng = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
      this.map.setCenter(latLng);
      this.map.setZoom(15);
    }).catch((error)=>{
      console.log('Error getting location',error);
    });
    });
  }
  loadHistoricRoutes(){
    this.storage.get('routes').then(data =>{
      if (data){
        this.previousTracks = data;
      }
    });
  }
  startTracking(){
    this.isTracking = true;
    this.trackedRoute =[];
    this.positionSubscription = this.geolocation.watchPosition().pipe(
      filter(p=> p.coords !== undefined)
    )
    .subscribe(data =>{
      setTimeout(()=>{
        this.trackedRoute.push({lat: data.coords.latitude, lng: data.coords.longitude});
        this.redrawPath(this.trackedRoute)
      })
    });
  }
  redrawPath(path){
    if(this.currentMapTrack){
      this.currentMapTrack.setMap(null);
    }
    if (path.length>1)
    this.currentMapTrack = new google.maps.Polyline({
      path:path,
      geodesic:true,
      strokeColor:'#ff00ff',
      stokeOpacity:1.0,
      strokeWeight:3,

    });
    this.currentMapTrack.setMap(this.map);
  }
  stopTracking(){
    let newRoute = { finished: new Date().getTime(), path: this.trackedRoute };
  this.previousTracks.push(newRoute);
  this.storage.set('routes', this.previousTracks);
 
  this.isTracking = false;
  this.positionSubscription.unsubscribe();
  this.currentMapTrack.setMap(null);
  }
  showHistoryRoute(route){
    this.redrawPath(route);
  }
}
