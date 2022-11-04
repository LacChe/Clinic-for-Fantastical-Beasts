import { LightningElement, api } from 'lwc';

export default class DialogueBox extends LightningElement {

    @api splashScreen;
    @api loading;
    @api prescribingStage;

    @api oppty;
    @api payment;
    @api price;
    @api beast;
    @api contact;
    @api account;

    @api treats;
    @api sicknessSymptoms;

    get loadingText(){
        return 'Loading...';
    }

    get cureText(){
        return 'If cured, you will receive $' + this.payment + '.';
    }
    
    get hasSymptoms(){
        return this.sicknessSymptoms.map(e => {
            return {name: e, style: this.treats.includes(e) ? 'slds-theme_success' : 'slds-theme_error'};
        });
    }

    get dialogueText(){
        if(this.splashScreen){
            return 'Nobody is currently here.';
        }
        if(!this.prescribingStage){
            if(this.oppty.Result__c == 0){
                return this.beast.Name + ' is still sick. You have lost $' + this.price + '.';
            } else if(this.oppty.Result__c == 100){
                if(this.payment - this.price < 0) return this.beast.Name + ' is cured! A perfect solution. You have lost $' + ((this.payment - this.price) * -1) + '.';
                return this.beast.Name + ' is cured! A perfect solution. You have gained $' + (this.payment - this.price) + '.';
            } else {
                return this.beast.Name + ' is cured. If only there were less side effects... You have gained $' + (this.payment - this.price) + '.';
            }
        }
        if(this.prescribingStage){
            return (this.contact.FirstName != null ? this.contact.FirstName : '') + ' ' + this.contact.LastName + ' from ' + this.account.Name + ' has brought ' + this.beast.Name + ', they are experiencing the following symptoms:';
        }
    }

}