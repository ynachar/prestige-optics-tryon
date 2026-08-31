import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-box',
  templateUrl: './modal-box.component.html',
  styleUrls: ['./modal-box.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class ModalBoxComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  open(msg:any, autoClose:Boolean, showSpinner:boolean) {
    var modalBox = document.getElementById("modalBoxWrapper");
    if(modalBox != null) {
      modalBox.style.visibility = 'visible';
      
      var modalContent = document.getElementById("modalContent");
      if(modalContent != null)
        modalContent.innerHTML = msg;

      if(autoClose){
        setTimeout(() => {
          if(modalBox != null)
            modalBox.style.visibility = 'hidden';
          },
          2500
        );
      }
      modalBox.style.visibility = 'visible';
    }

    var spinnerBox = document.getElementById("spinnerBox");
    if(spinnerBox != null) {
      //console.log('spinnerBox: ' + spinnerBox + '|' + showSpinner );
      if(showSpinner) {
        spinnerBox.style.display = 'inline-block';  
      }
      else {
        spinnerBox.style.display = 'none';
      }
    }
  }

  close() {
    var modalBox = document.getElementById("modalBoxWrapper");
    if(modalBox != null)
        modalBox.style.visibility = 'hidden';

    var spinnerBox = document.getElementById("spinnerBox");
      if(spinnerBox != null) 
        spinnerBox.style.display = 'none';  
  }

}
