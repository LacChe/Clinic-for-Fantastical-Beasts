import { LightningElement, api } from 'lwc';

export default class TreatmentBox extends LightningElement {
    
    @api price;
    @api sicknessSymptoms;
    @api treats = [];

    get treatsSymptoms(){
        if(this.treats.length > 0)
            return this.treats.map(e => {
                return {name: e, style: this.sicknessSymptoms.includes(e) ? 'slds-theme_success' : 'slds-theme_warning'};
            });
            return null;
    }

    get treatmentText(){
        if(this.treats.length > 0) return 'These ingredients cost $' + this.price + ' and treat sicknesses showing the following symptoms:';
        return 'No ingredients selected.';
    }

}