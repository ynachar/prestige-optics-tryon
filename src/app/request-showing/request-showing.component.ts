import { Component, OnInit } from '@angular/core';
import { EmailService } from '../email.service';
import { FormBuilder, FormControl,  FormGroup, Validators } from '@angular/forms';
import { CartComponent } from '../cart/cart.component';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { ModalBoxComponent } from '../modal-box/modal-box.component';

import globalStyle from '../../styles.css';
import topBarComponentCss from '../top-bar/top-bar.component.css';
import cartComponentCss from '../cart/cart.component.css';
import contactUsComponentCss from '../contact-us/contact-us.component.css';
import bottomBarComponentCss from '../bottom-bar/bottom-bar.component.css';

import topBarComponentHtml from '../top-bar/top-bar.component.html';
import bottomBarComponentHtml from '../bottom-bar/bottom-bar.component.html';
import { Subject } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-request-showing',
  templateUrl: './request-showing.component.html',
  styleUrls: ['./request-showing.component.css']
})

export class RequestShowingComponent implements OnInit {
  items;
  cartTotal;
  itemsCnt;
  
  formData:FormGroup;

  siteUrl;

  constructor(
    private cart:CartComponent,
    private contact:ContactUsComponent,
    private formBuilder:FormBuilder,
    private emailService:EmailService,
    private modalBox: ModalBoxComponent
  ) { }

  ngOnInit() {    
    this.siteUrl = 'https://angular-ffxezk-t6mb7a.stackblitz.io';

    this.getCartVals();
    this.setDateTimePicker();

    this.buildFormData();

    window.dispatchEvent(new CustomEvent('ngRunFlatPickr'));
  }

  displayFormSubmissionMessage() {
    //Hide form
    var form = document.getElementById("contactForm");
    if(form != null)
        form.style.display = 'none';

    //Display confirmation message
    var confMessage = document.getElementById("formSubmissionMessage");
    if(confMessage != null)
        confMessage.style.display = 'block';
  }

  async onSubmit(form) {
    let msg = 'Processing showing request...';
    this.modalBox.open(msg, false, true);
    let to = form.emailAddress;
    let emailSubject = 'Showing request - ' + form.firstName + ' ' + form.lastName + ' on ' + form.date;
    let emailBody = this.buildEmailBody(form);
    //console.log'emailBody: \r\n \r\n' + emailBody);

    //console.log(form)
    try 
    {
      let response = await this.emailService.SendEmail(to, emailSubject, emailBody);
      //console.log('response: ' + response);

      if (response == 'OK') {
        console.log('success: ' + response);
        this.displayFormSubmissionMessage();

        this.cart.clearCart();
        this.modalBox.close();
      }
      else {
        console.log('timeout: ' + response);
        this.modalBox.close();
        this.modalBox.open(response, false, false);
      }
    }
    catch (e) {
      console.log('exception: ' + e);
      this.modalBox.close();
      this.modalBox.open(e, false, false);
    }
  }

  currencyFormatter(val) {  
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });    
  }

  buildFormData() {
    this.formData = this.formBuilder.group({
      firstName:    new FormControl('', [Validators.required]),
      lastName:     new FormControl('', [Validators.required]),
      emailAddress: new FormControl('', [Validators.compose([Validators.required, Validators.email])]),
      phoneNumber:  new FormControl('', [Validators.required]),
      date:         new FormControl('', [Validators.required]),
      comment:      new FormControl('', )
    })
  }

  buildEmailBody(form) {
    let body = '';

    /*
    body = '<!DOCTYPE html> \r\n';
    body +='<html> \r\n';
    body +='\t<head> \r\n';
    */
    
    body +=`\t\t<style>\r\n \t ${globalStyle}</style> \r\n`;
    body +=`\t\t<style>\r\n \t ${topBarComponentCss}</style> \r\n`;
    body +=`\t\t<style>\r\n \t ${cartComponentCss}</style>\r\n`;
    body +=`\t\t<style>\r\n \t ${contactUsComponentCss}</style>\r\n`;
    body +=`\t\t<style>\r\n \t ${bottomBarComponentCss}</style>`;
    /*
    body +=`
    </head>
    <body> `;
    */
    body +=`
    \t<\app-root>\r\n`;

    body += '\t\t\t<app-top-bar> \r\n';
    body += topBarComponentHtml + '\r\n';
    body += '\t\t\t</app-top-bar>';

    body +=`
    \t\t<app-menu></app-menu>    
    `;

    /* Customer sction */
    body +=`
      \t\t<div class="container">
      \t\t\t<router-outlet></router-outlet>
      \t\t\t<app-contact-us>\r\n
      \t\t\t\t<div class="pageContainer">
      \t\t\t\t\t<div class="pageTitle"><h2>Customer</h2></div> 
      \t\t\t\t\t<div class="contactInfo"> `;    

    body += `
      \t\t\t\t\t\t<div>
      \t\t\t\t\t\t\t<div class="contactValue"> ${form.firstName} ${form.lastName}  </div>
      \t\t\t\t\t\t\t<div class="contactValue"> ${form.emailAddress} </div>
      \t\t\t\t\t\t\t<div class="contactValue"> ${form.phoneNumber} </div>
      \t\t\t\t\t\t\t<div class="contactValue"> ${form.date } </div>
      \t\t\t\t\t\t\t<div class="contactValue"> Comment: ${form.comment} </div>
      \t\t\t\t\t\t</div>
      `;
    
    body +=`
        \t\t\t\t\t</div>
        \t\t\t\t</div>
        \t\t\t</app-contact-us>\r\n
        \t\t</div>`;
    /* End of Customer sction */

    /* Showing request section */
    body +=`
    \t\t<div class="container">
    \t\t\t<router-outlet></router-outlet>
    \t\t\t<app-cart>
    \t\t\t\t<div class="pageContainer">
    \t\t\t\t\t<div class="pageTitle"><h2>Showing Request</h2></div>
    \t\t\t\t\t<div class="cartItemBox">`;

    //\t\t\t\t\t<input value="${index}" hidden/>

    this.items.forEach((item, index) => {
      let priceFormatted = this.currencyFormatter(item.price);
      body += ` 
        \t\t\t\t<div class="cartItem">
        \t\t\t\t\t<div class="imgProdBox">
        \t\t\t\t\t\t<img id="imgProduct" src="${item.img}" alt="image"/>
        \t\t\t\t\t</div>
        \t\t\t\t\t<div class="prodDetBox">
        \t\t\t\t\t\t<a href="${this.siteUrl}/products/${index}">${item.name}</a><br />
        \t\t\t\t\t\t<span class="itemDescr">${item.detail}</span>       
        \t\t\t\t\t</div>  
        \t\t\t\t\t<div class="priceProdBox">
        \t\t\t\t\t\t<span class="textRight">${priceFormatted}</span>  
        \t\t\t\t\t</div>
        \t\t\t\t\t<div class="itemQty">
        \t\t\t\t\t\t<span>Qty<br />${item.qty}</span>
        \t\t\t\t\t</div>
        \t\t\t\t</div>`;
    })    

    body +=`
      \t\t\t\t\t</div>
      \t\t\t\t\t<div class="cartSummary">
      \t\t\t\t\t\t<div class="cartSummaryHdr">Cart Summary</div>
      \t\t\t\t\t\t<div class="cartSummaryCntBox">
      \t\t\t\t\t\t\t<div class="cartTotalText">Items in the basket: </div>
      \t\t\t\t\t\t\t<div class="cartTotalAmount">${this.itemsCnt}</div>
      \t\t\t\t\t\t</div>
      \t\t\t\t\t\t<div class="cartSummaryBox">
      \t\t\t\t\t\t\t<div class="cartTotalText">Cart Total</div>
      \t\t\t\t\t\t\t<div class="cartTotalAmount">${this.currencyFormatter(this.cartTotal)}</div>
      \t\t\t\t\t\t</div>
      \t\t\t\t\t</div>\r\n`;
    
    body +='\t\t\t\t\t</div>\r\n';
    body +='\t\t\t\t</app-cart>\r\n';
    body +='\t\t\t</div>\r\n';
    /* End of Showing request section */

    /* Contact section */
    body +=`
      \t\t<div class="container">
      \t\t\t<router-outlet></router-outlet>
      \t\t\t<app-contact-us>\r\n
      \t\t\t\t<div class="pageContainer">
      \t\t\t\t\t<div class="pageTitle"><h2>Contact</h2></div> 
      \t\t\t\t\t<div class="contactInfo"> `;
    
    this.contact.contactInfo.forEach((conInfo: any) => {
      (conInfo.location || [conInfo]).forEach((entry: any) => {
        body += `
      \t\t\t\t\t\t<div>
      \t\t\t\t\t\t\t<div class="contactType"> ${entry.contactType}: </div>
      \t\t\t\t\t\t\t<div class="contactValue"> ${entry.contactValue} </div>
      \t\t\t\t\t\t</div>
      `;
      });
    })

    body +=`
        \t\t\t\t\t</div>        
        `;
    body += `
        \t\t\t\t<br />
  <embed src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6648.04427163739!2d-7.655308842658986!3d33.578774519804426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xa23eed84edac9a4f!2sThe%20optical!5e0!3m2!1sen!2sus!4v1600799343079!5m2!1sen!2sus" width="90%" height="425" frameborder="1" class="embededMap" allowfullscreen="" aria-hidden="false" tabindex="0"></embed>
        \t\t\t\t</div>
        \t\t\t</app-contact-us>\r\n
        \t\t</div>`;    
    /* End of Contact section */

    body += '\t\t\t<app-bottom-bar> \r\n';
    body += bottomBarComponentHtml + '\r\n';
    body += '\t\t\t</app-bottom-bar> \r\n';
    
    body +=`\t\t</app-root>\r\n`;
    /*
    body +=`\t</body>\r\n</html>`;
    */
    //make necessary replacements
    body = body.replace('style="visibility: visible;"', 'style="visibility: hidden;"');
    body = body.replace('{{ currentYear }}', new Date().getFullYear().toString());
    body = body.replace('margin-bottom: 50px;', '');
    body = body.replace('min-height: 550px;', '');    
    
    return body;
  }

  getCartVals() {
    this.cart.ngOnInit();

    this.items = this.cart.items;
    this.cartTotal = this.cart.cartTotal;
    this.itemsCnt = this.cart.itemsCnt;
  }

  setDateTimePicker() {
    var futuredate = new Date();
    futuredate.setDate(futuredate.getDate() + 1);
    var isoString = futuredate.toISOString();
    const val = isoString.substring(0, (isoString.indexOf("T")|0) + 6|0);
    console.log('val: ' + val);
    //document.querySelector("#dateTimePicker").min = val;
    //document.querySelector("#dateTimePicker").value = val;
  }

}