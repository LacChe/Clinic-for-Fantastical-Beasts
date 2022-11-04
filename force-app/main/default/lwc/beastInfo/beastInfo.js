import { LightningElement, api } from 'lwc';
import IMAGES from "@salesforce/resourceUrl/static_images";

export default class BeastInfo extends LightningElement {

    @api beast;
    
    get beastImageUrl(){
        return IMAGES + '/beast_imgs/' + this.beast.Name + '.jpg';
    }

}