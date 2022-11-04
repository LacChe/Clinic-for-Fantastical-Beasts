import { LightningElement, wire } from 'lwc';
import { updateRecord, createRecord } from 'lightning/uiRecordApi';

import getNewOppty from '@salesforce/apex/RecordController.getNewOppty';
import getAccountFromOppty from '@salesforce/apex/RecordController.getAccountFromOppty';
import getBeastFromOppty from '@salesforce/apex/RecordController.getBeastFromOppty';
import getSicknessFromOppty from '@salesforce/apex/RecordController.getSicknessFromOppty';
import getContactFromBeast from '@salesforce/apex/RecordController.getContactFromBeast';
import getFinances from '@salesforce/apex/RecordController.getFinances';
import setFinanceAmount from '@salesforce/apex/RecordController.setFinanceAmount';

const sPrice = new Map([
    ['Cold', 30],
    ['Heat', 120],
    ['Fatigue', 100],
    ['Dizziness', 150],
    ['Dryness', 60],
    ['Dampness', 50],
    ['Rash', 80],
    ['Shedding', 200]
]);

export default class PrescriptionMakerFrame extends LightningElement {

    loading = true;
    prescribing = true;

    splashScreen = true;
    prescribingStage = false;

    selectedProducts = [];
    sicknessSymptoms = [];

    treats = [];
    price = 0;

    error;
    products = [];

    oppty = null;
    account = null;
    contact = null;
    beast = null;
    sickness = null;
    finance = null;


    @wire(getFinances)
    wiredFinance(result) {
        const { data, error } = result;
        if(data) {
            this.finance = data;
        }
        if(error) {
            this.error = error;
        }
    }

    get payment(){
        var p = 0;
        for(let i = 0; i < this.sicknessSymptoms.length; i++){
            p += sPrice.get(this.sicknessSymptoms[i]);
        }
        return p * 1.8;
    }

    get showProgressionButtons(){
        return this.loading == false || this.prescribing == false || this.splashScreen == true;
    }

    handleProductSelection(event){
        this.selectedProducts = event.detail.products;
        var text = "";
        this.price = 0;
        this.selectedProducts = event.detail.products;
        if(this.selectedProducts.length == 0) {
            this.treats = [];
            return;
        }
        for (let i = 0; i < this.selectedProducts.length; i++) {
            text += this.selectedProducts[i].Treats__c;
            this.price += this.selectedProducts[i].UnitPrice;
        }
        this.treats = [...new Set(text.slice(0, -1).split(";"))];
    }

    async prescribe(event){
        
        this.prescribing == true;

        this.prescribingStage = false;

        var result = 0;
        var stage = 'Cured';

        for(let i = 0; i < this.sicknessSymptoms.length; i++){
            if(!this.treats.includes(this.sicknessSymptoms[i])) stage = 'Sick';
        }
        
        result = (stage == 'Sick') ? 0 : this.sicknessSymptoms.length * 100 / this.treats.length;
        this.oppty.Result__c = result;
        this.oppty.StageName = stage;

        var profit = (stage == 'Cured' ? this.payment : 0) - this.price;

        let fields = {
            'Id': this.oppty.Id,
            'Result__c': this.oppty.Result__c,
            'StageName': this.oppty.StageName,
            'Profit__c': profit
        };

        let recordInput = { fields };

        await updateRecord(recordInput).then(() => {
        }).catch(error => {
        });

        if(stage == 'Cured'){
            for(let i = 0; i < this.selectedProducts.length; i++){

                fields = {};
                fields = {
                    'OpportunityId' : this.oppty.Id,
                    'Product2Id' : this.selectedProducts[i].Product2Id,
                    'Quantity' : 1,
                    'UnitPrice' : this.selectedProducts[i].UnitPrice,
                    'Pricebook2Id' : this.selectedProducts[i].Pricebook2Id
                };
                var objRecordInput = {'apiName' : 'OpportunityLineItem', fields};

                await createRecord(objRecordInput).then(response => {
                    //console.log(record);
                }).catch(error => {
                    //console.log(error);
                });
            }
        } 

        await setFinanceAmount({ profit: profit}).then(result => {
            this.finance = result;
        }).catch(error => {
        });

        this.prescribing == false;
    }

    async getOppty(event){
        this.loading = true;

        await getNewOppty().then(result => {
            this.oppty = result;
        }).catch(error => {
            this.error = error;
        });

        await getAccountFromOppty({opptyId: this.oppty.Id}).then(result => {
            this.account = result;
        }).catch(error => {
            this.error = error;
        });
        
        await getBeastFromOppty({opptyId: this.oppty.Id}).then(result => {
            this.beast = result;
        }).catch(error => {
            this.error = error;
        });
        
        await getSicknessFromOppty({opptyId: this.oppty.Id}).then(result => {
            this.sickness = result;
            this.sicknessSymptoms = [...new Set(this.sickness.Symptoms__c.split(";"))];
        }).catch(error => {
            this.error = error;
        });
        
        await getContactFromBeast({beastId: this.beast.Id}).then(result => {
            this.contact = result;
        }).catch(error => {
            this.error = error;
        });
        
        this.loading = false;
        
        this.splashScreen = false;
        this.prescribingStage = true;
    }

}