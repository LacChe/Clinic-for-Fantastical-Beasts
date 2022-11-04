import { LightningElement, api } from 'lwc';
import IMAGES from "@salesforce/resourceUrl/static_images";

export default class ContactInfo extends LightningElement {

    @api contact;
    @api account;
    
    get contactImageUrl(){
        return IMAGES + '/contact_imgs/' + this.contact.LastName + '.jpg';
    }

}