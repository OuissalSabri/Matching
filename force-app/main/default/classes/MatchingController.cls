public with sharing class MatchingController {

    @AuraEnabled(cacheable=true)
    public static List<Candidat__c> searchCandidates(String domaineDiplome, String typeDiplomeDemande, String salaireDemande, String contratDemande, String niveauExperience, List<String> competencesRequises) {
        
        List<Candidat__c> matchingCandidates = new List<Candidat__c>();

        
        System.debug('domaineDiplome: ' + domaineDiplome);
        System.debug('typeDiplomeDemande: ' + typeDiplomeDemande);
        System.debug('salaireDemande: ' + salaireDemande);
        System.debug('contratDemande: ' + contratDemande);
        System.debug('niveauExperience: ' + niveauExperience);
        System.debug('competencesRequises: ' + competencesRequises);

        
        String initialQuery = 'SELECT Name, Id, Nom__c, Statut__c, Pr_nom__c, Poste__c, T_l_phone__c, Adress_email__c, Salaire_souhait__c, Type_de_contrat_recherch__c ' +
                              'FROM Candidat__c ' +
                              'WHERE Id IN (SELECT Candidat__c FROM Etudes__c WHERE Domaines_Diplome__c = :domaineDiplome AND Type_de_Diplome__c = :typeDiplomeDemande)';

        System.debug('Initial Query: ' + initialQuery);

        List<Candidat__c> initialCandidates = Database.query(initialQuery);

        System.debug('Initial Candidates: ' + initialCandidates);

        // Filtrer par salaire demandé
        if (!String.isBlank(salaireDemande)) {
            List<Candidat__c> filteredBySalary = new List<Candidat__c>();
            for (Candidat__c candidate : initialCandidates) {
                if (candidate.Salaire_souhait__c != null && candidate.Salaire_souhait__c == salaireDemande) {
                    filteredBySalary.add(candidate);
                }
            }
            initialCandidates = filteredBySalary;
        }

        // Filtrer par type de contrat
        if (!String.isBlank(contratDemande)) {
            List<Candidat__c> filteredByContract = new List<Candidat__c>();
            for (Candidat__c candidate : initialCandidates) {
                if (candidate.Type_de_contrat_recherch__c != null && candidate.Type_de_contrat_recherch__c == contratDemande) {
                    filteredByContract.add(candidate);
                }
            }
            initialCandidates = filteredByContract;
        }

        // Filtrer par expérience
        if (!String.isBlank(niveauExperience)) {
            Set<Id> candidateIds = new Set<Id>();
            for (Candidat__c candidate : initialCandidates) {
                candidateIds.add(candidate.Id);
            }

            String experienceQuery = 'SELECT Candidat__c ' +
                                     'FROM Experience__c ' +
                                     'WHERE Domaine__c = :domaineDiplome AND Niveau_d_experience__c = :niveauExperience ' +
                                     'AND Candidat__c IN :candidateIds';

            System.debug('Experience Query: ' + experienceQuery);

            List<Experience__c> experienceResults = Database.query(experienceQuery);
            Set<Id> experiencedCandidateIds = new Set<Id>();
            for (Experience__c experience : experienceResults) {
                experiencedCandidateIds.add(experience.Candidat__c);
            }

            List<Candidat__c> filteredByExperience = new List<Candidat__c>();
            for (Candidat__c candidate : initialCandidates) {
                if (experiencedCandidateIds.contains(candidate.Id)) {
                    filteredByExperience.add(candidate);
                }
            }
            initialCandidates = filteredByExperience;
        }

        // Filtrer par compétences requises
        if (competencesRequises != null && !competencesRequises.isEmpty()) {
            Set<Id> candidateIds = new Set<Id>();
            for (Candidat__c candidate : initialCandidates) {
                candidateIds.add(candidate.Id);
            }

            String competenceQuery = 'SELECT Candidat__c ' +
                                     'FROM Comp_tences_Candidat__c ' +
                                     'WHERE Comp_tences__r.Comp_tences_Name__c IN :competencesRequises ' +
                                     'AND Candidat__c IN :candidateIds';

            System.debug('Competence Query: ' + competenceQuery);

            List<Comp_tences_Candidat__c> competenceResults = Database.query(competenceQuery);
            Set<Id> competentCandidateIds = new Set<Id>();
            for (Comp_tences_Candidat__c competence : competenceResults) {
                competentCandidateIds.add(competence.Candidat__c);
            }

            List<Candidat__c> filteredByCompetence = new List<Candidat__c>();
            for (Candidat__c candidate : initialCandidates) {
                if (competentCandidateIds.contains(candidate.Id)) {
                    filteredByCompetence.add(candidate);
                }
            }
            initialCandidates = filteredByCompetence;
        }

        //Les candidats finaux qui ont passé tous les filtres
        matchingCandidates.addAll(initialCandidates);

        System.debug('Matching Candidates: ' + matchingCandidates);

        return matchingCandidates;
    }
}
