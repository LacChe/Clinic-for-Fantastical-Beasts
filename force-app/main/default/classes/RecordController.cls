public without sharing class RecordController {
    
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getStandardProducts() {
        Pricebook2 pb = [select Id from PriceBook2 where IsStandard=True LIMIT 1];
        List<PricebookEntry> products = [SELECT Id, Name, UnitPrice, Product2Id, Treats__c FROM PricebookEntry WHERE Pricebook2Id =: pb.Id];
        return products;
    }
    
    @AuraEnabled
    public static Opportunity getNewOppty() {
        
        // get random beast
        List<Beast__c> beasts = [select Id, Name, Species__c, Contact__c, Account__c from Beast__c];
        Integer index = (Math.random() * (beasts.size() - 1)).intValue();
        
        // if beast has existing opportunity, return it
        List<Opportunity> existingOpptys = [select Id, StageName, Beast__c, AccountId, Sickness__c, Result__c from Opportunity where Beast__c =: beasts[index].Id and StageName = 'Sick'];
        if(existingOpptys.size() > 0) return existingOpptys[0];
        
		// otherwise make a new one
        Opportunity newOppty = new Opportunity();
        
        newOppty.RecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('Medical Opportunity').getRecordTypeId();        
        newOppty.Pricebook2Id = [select Id from Pricebook2 limit 1].id;
        newOppty.Name = DateTime.now() + '';
        newOppty.CloseDate = Date.today() + 300;
        newOppty.StageName = 'Sick';
        newOppty.Result__c = 0;
        
        newOppty.Beast__c = beasts[index].Id;
        
        newOppty.AccountId = beasts[index].Account__c;
        
        List<Sickness__c> sicknesses = [select Id, Name, Symptoms__c from Sickness__c];
        index = (Math.random() * (sicknesses.size() - 1)).intValue();
        newOppty.Sickness__c = sicknesses[index].Id;
        
        insert newOppty;

        return newOppty;
    }
    
    @AuraEnabled(cacheable=true)
    public static Finance__c getFinances() {
        return [select Id, Name, Amount__c from Finance__c limit 1];
    }
    
    @AuraEnabled
    public static Finance__c setFinanceAmount(Integer profit) {
        Finance__c f = [select Id, Name, Amount__c from Finance__c limit 1];
        f.Amount__c += profit;
        update f;
        return f;
    }
    
    @AuraEnabled
    public static Account getAccountFromOppty(String opptyId) {
        System.debug(opptyId);
		Opportunity oppty = [select AccountId from Opportunity where Id =: opptyId limit 1];        
        Account acc = [select Id, Name from Account where Id =: oppty.AccountId limit 1];
        return acc;
    }
    
    @AuraEnabled
    public static Beast__c getBeastFromOppty(String opptyId) {
        System.debug(opptyId);
		Opportunity oppty = [select Beast__c from Opportunity where Id =: opptyId limit 1];        
        Beast__c beast = [select Id, Name, Contact__c, Species__c from Beast__c where Id =: oppty.Beast__c limit 1];
        return beast;
    }
    
    @AuraEnabled
    public static Sickness__c getSicknessFromOppty(String opptyId) {
        System.debug(opptyId);
		Opportunity oppty = [select Sickness__c from Opportunity where Id =: opptyId limit 1];        
        Sickness__c sickness = [select Id, Name, Symptoms__c from Sickness__c where Id =: oppty.Sickness__c limit 1];
        return sickness;
    }
    
    @AuraEnabled
    public static Contact getContactFromBeast(String beastId) {
        System.debug(beastId);
		Beast__c beast = [select Contact__c, Account__c from Beast__c where Id =: beastId limit 1];
        
        if(beast.Contact__c != null) return [select Id, FirstName, LastName from Contact where Id =: beast.Contact__c limit 1];
        
        List<Contact> contacts = [select Id, FirstName, LastName from Contact where AccountId =: beast.Account__c];
        Integer index = (Math.random() * (contacts.size() - 1)).intValue();
        return contacts[index];
    }
    
}