import { LightningElement, api } from 'lwc';

export default class ProgressionButtons extends LightningElement {

    @api finance = null;
    @api showProgressionButtons = null;
    @api prescribingStage = null;
    
    get financeText(){
        if(this.finance.Amount__c < 0) return '-$' + this.finance.Amount__c * -1;
        else return '$' + this.finance.Amount__c;
    }

    getOpptyClick(event){
        this.selectedProducts = event.detail.selectedRows;
        const e = new CustomEvent('getoppty', {});
        this.dispatchEvent(e);
    }

    prescribeClick(event){
        this.selectedProducts = event.detail.selectedRows;
        const e = new CustomEvent('prescribe', {});
        this.dispatchEvent(e);
    }

}