import { LightningElement, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import searchCandidates from '@salesforce/apex/MatchingController.searchCandidates';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Matching extends NavigationMixin(LightningElement) {
    @track diplomaOptions;
    @track domainOptions;
    @track salaryOptions;
    @track contractOptions;
    @track competenceOptions;
    @track experienceOptions;
    @track diploma;
    @track domain;
    @track salary;
    @track contract;
    @track experienceLevel;
    @track competences = [];
    @track candidates = [];
    @track showResults=true;
    @wire(getObjectInfo, { objectApiName: 'Offre_Emploi__c' })
    objectInfo;
    @wire(getObjectInfo, { objectApiName: 'Competences__c' })
    objectInfo2;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: 'Offre_Emploi__c.Type_de_diplome_demand__c' })
    wiredDiploma({ error, data }) {
        if (data) {
            this.diplomaOptions = data.values.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error loading picklist values: ', error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: 'Offre_Emploi__c.Domaine_Diplome__c' })
    wiredDomain({ error, data }) {
        if (data) {
            this.domainOptions = data.values.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error loading picklist values: ', error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: 'Offre_Emploi__c.Salaire_propos__c' })
    wiredSalary({ error, data }) {
        if (data) {
            this.salaryOptions = data.values.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error loading picklist values: ', error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: 'Offre_Emploi__c.Type_de_contrat__c' })
    wiredContract({ error, data }) {
        if (data) {
            this.contractOptions = data.values.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error loading picklist values: ', error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: 'Offre_Emploi__c.Niveaux_d_exp_rience__c' })
    wiredExperienceLevel({ error, data }) {
        if (data) {
            this.experienceOptions = data.values.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error loading picklist values: ', error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '$objectInfo2.data.defaultRecordTypeId', fieldApiName: 'Competences__c.Comp_tences_Name__c' })
    wiredCompetences({ error, data }) {
        if (data) {
            this.competenceOptions = data.values.map(option => ({ label: option.label, value: option.value }));
        } else if (error) {
            console.error('Error loading picklist values: ', error);
        }
    }

    handleDiplomaChange(event) {
        this.diploma = event.detail.value;
    }

    handleCompetenceChange(event) {
        this.competences = event.detail.value;
    }
    handleExperienceChange(event) {
        this.experienceLevel= event.detail.value;
    }

    handleContractChange(event) {
        this.contract = event.detail.value;
    }
    handleSalaryChange(event) {
        this.salary = event.detail.value;
    }
    handleDomainChange(event) {
        this.domain = event.detail.value;
    }


    handleSearch(event) {
        console.log("handle search is clicked");
        
        const domaineDiplome = this.domain;
        const typeDiplomeDemande = this.diploma;
        const salaireDemande = this.salary;
        const contratDemande = this.contract;
        const niveauExperience = this.experienceLevel;
        const competencesRequises = this.competences;

        console.log('domaineDiplome:', domaineDiplome);
        console.log('typeDiplomeDemande:', typeDiplomeDemande);
        console.log('salaireDemande:', salaireDemande);
        console.log('contratDemande:', contratDemande);
        console.log('niveauExperience:', niveauExperience);
        console.log('competencesRequises:', competencesRequises);
        
        searchCandidates({
            domaineDiplome,
            typeDiplomeDemande,
            salaireDemande,
            contratDemande,
            niveauExperience,
            competencesRequises: [...competencesRequises] 
        })
        .then(matchingCandidates => {
            console.log('liiiiiist:', matchingCandidates);
            if (matchingCandidates && matchingCandidates.length > 0) {
                this.candidates =matchingCandidates;
                this.showResults = true; 
                console.log(this.showResults);
            } else {
                console.log('else no candidat');
                
                this.showResults = false;
                console.log('Aucun candidat trouvé.');
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Aucun candidat trouvé!',
                    message: 'Aucun candidat trouvé!',
                    variant: 'warning',
                    mode: 'dismissable'
                }));
            }
        })
        
       
        .catch(error => {
            console.error('Error searching candidates:', error);
        });
    }
    handleNavigation(event) {
        const candidateId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: candidateId,
                objectApiName: 'Candidat__c',
                actionName: 'view'
            }
        });
    }
    
    
}
