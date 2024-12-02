import * as utils from "./js/utils.js";
import * as display from "./js/display.js";
import { dictionary } from "./lang/dictionary.js";
import { toggleDropdown } from "./js/display.js";
import * as calcul from "./js/calcul.js";
import * as change_language from "./js/change_language.js"

const WARNING_THRESHOLD_NBR_JRS = 40;
const WARNING_THRESHOLD_NBR_ATTACHES = 300000;
const WARNING_KEY_NBR_JRS = display.WARNING_KEY_NBR_JRS;
const WARNING_KEY_NBR_ATTACHES = display.WARNING_KEY_NBR_ATTACHES;
const WARNING_KEY_LANG_NOT_AVAILABLE = display.WARNING_KEY_LANG_NOT_AVAILABLE;


let language = 'fr';
let bar_graph = null;
let curve_chart = null;
let pie_charts=null;
let warningModal = null;
let stackWarnings = [];


function init_document(){
    // Masquer les tooltips si l’utilisateur clique ailleurs
    document.addEventListener('click', function (event) {
        const helpIcon = event.target.closest('.help-icon'); // Vérifie si on a cliqué sur une icône d'aide
        if (!helpIcon) {
            // Masquer tous les tooltips
            document.querySelectorAll('.help-icon').forEach(icon => icon.classList.remove('tooltip-active'));
        }
    });
    // Initialisation
    language = document.getElementById('selected-language').innerText;
    // Attache l'événement au clic
    document.getElementById('show-more-options').addEventListener('click', display.toggleExtraOptions);
    document.getElementById('show-less-options').addEventListener('click', display.toggleExtraOptions);
    document.getElementById('show-more-results').addEventListener('click', display.toggleExtraResults);
    document.getElementById('show-less-results').addEventListener('click', display.toggleExtraResults);
    document.getElementById('show-more-pie-chart').addEventListener('click',display.toggleAllPieCharts);
    document.getElementById('show-less-pie-chart').addEventListener('click',display.toggleAllPieCharts);
    document.getElementById('calculate-button').addEventListener('click',launchCalculation);
    // Rendre la fonction globale
    window.toggleDropdown = toggleDropdown;
    window.selectLanguage = selectLanguage;
    // change lang to charge page
    change_language.change_language(language);
}

// Initialisation de la langue
function checkLanguage() {
    let language_selected = document.getElementById('selected-language').innerText;
    if (change_language.availableLanguage(language_selected)){
        language = language_selected;
        change_language.change_language(language);

    }
    else {
        console.log(WARNING_KEY_LANG_NOT_AVAILABLE);
        stackWarnings.push([WARNING_KEY_LANG_NOT_AVAILABLE,[""]]);
    }
    stackWarnings = utils.manageStack(stackWarnings);
    
}

// Lancer le calcul
function launchCalculation() {
    if (utils.validateInputs(language)) {
        let inputs = dictionary[language].inputFields.map((_, index) => parseFloat(document.getElementById(`input-${index}`).value));
        let extra_inputs = dictionary[language].extraOptions.map((_, index) => parseFloat(document.getElementById(`input-extra-${index}`).value));
        let [results,chart_data] = calcul.calculateResults(inputs, extra_inputs,language);
        let state_checkboxes = 
        display.displayResultsRaw(results,language);
        // console.log(bar_graph);
        bar_graph =  display.displayResultsBarGraph(chart_data, bar_graph,state_checkboxes);
        curve_chart = display.displayResultsCurveGraph(chart_data,curve_chart);
        
        // Appel de la fonction
        pie_charts = display.displayPieCharts(chart_data, pie_charts);
        
        if (results.nombre_de_jours_parcelle[0]>=WARNING_THRESHOLD_NBR_JRS){
            stackWarnings.push([WARNING_KEY_NBR_JRS,[results.nombre_de_jours_parcelle[0]]]);
        }

        if (results.total_attaches_par_outil[0]>WARNING_THRESHOLD_NBR_ATTACHES){
            stackWarnings.push([WARNING_KEY_NBR_ATTACHES,[results.total_attaches_par_outil[0]]]);
        }
        stackWarnings = utils.manageStack(stackWarnings);
        // saveResultsAsJson(inputs, results);
    }
    else {

    }
}

function selectLanguage(language, code) {
    // Met à jour le texte et l'icône du bouton principal
    document.getElementById('selected-language').innerText = language;
    document.querySelector('.dropdown-toggle img').src = `icons/flags/${code}.png`; // Met à jour l'icône du drapeau
    // Ferme le menu après la sélection
    toggleDropdown();
    // Appeler la fonction de changement de langue si nécessaire
    checkLanguage();
}

init_document();

