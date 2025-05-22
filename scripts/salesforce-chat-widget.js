 
    var initESW = function(gslbBaseURL) {
        embedded_svc.settings.displayHelpButton = true; //Or false
        embedded_svc.settings.language = ''; //For example, enter 'en' or 'en-US'

        //embedded_svc.settings.defaultMinimizedText = '...'; //(Defaults to Chat with an Expert)
        //embedded_svc.settings.disabledMinimizedText = '...'; //(Defaults to Agent Offline)
    

        //embedded_svc.settings.loadingText = ''; //(Defaults to Loading)
        //embedded_svc.settings.storageDomain = 'yourdomain.com'; //(Sets the domain for your deployment so that visitors can navigate subdomains during a chat session)

        // Settings for Chat
        embedded_svc.settings.directToButtonRouting = function(prechatFormData) {
            prechatFormData[8].value='Website - Live Chat';
            prechatFormData[9].value='True';
            prechatFormData[10].value='Website - Live Chat';
        };
        //embedded_svc.settings.prepopulatedPrechatFields = {}; //Sets the auto-population of pre-chat form fields
        //embedded_svc.settings.fallbackRouting = []; //An array of button IDs, user IDs, or userId_buttonId
          embedded_svc.settings.defaultMinimizedText = 'Chat with an expert'; //(Defaults to Chat with an Expert)
        //embedded_svc.settings.offlineSupportMinimizedText = '...'; //(Defaults to Contact Us)
            embedded_svc.settings.offlineSupportMinimizedText = 'Chat offline'; 
             embedded_svc.addEventHandler("onHelpButtonClick", function(data) {
   
    setTimeout(function(){ document.getElementsByClassName("embeddedServiceIcon")[0].removeAttribute("style"); 
   }, 3000);
    });
    var i=0;
    embedded_svc.addEventHandler("afterMaximize", function(data) {
  
    setTimeout(function(){ 
   // var ele=document.getElementById('LeadSource').style;
   document.getElementById('Lead_Source_Most_Recent__c').style.visibility='hidden';
   document.getElementById('handrise_list__c').style.visibility='hidden';
   document.getElementById('LeadSource').style.visibility='hidden';
   document.getElementById('is_Follow_up_Required__c').style.visibility='hidden';
   document.getElementsByClassName("uiLabel-left form-element__label uiLabel")[7].innerHTML='Yes, I would like to opt-in to receive updates and other communications via email from Ingredion.';
   document.getElementsByClassName("uiLabel-left form-element__label uiLabel")[8].style.display='none';
   document.getElementsByClassName("uiLabel-left form-element__label uiLabel")[9].style.display='none';
    document.getElementsByClassName("uiLabel-left form-element__label uiLabel")[10].style.display='none';
   document.getElementsByClassName("uiLabel-left form-element__label uiLabel")[11].style.display='none';
   
  

  }, 3000);
  
  
    
  if(i == 0){
   let newcontentAbc = document.createElement('div');
   newcontentAbc.innerHTML='</br>Information we are required to provide to you prior to processing your data as described in the General Data Protection Directive (GDPR) is available to you in our <a href="https://www.ingredion.com/na/en-us/legal/privacy-policy.html">privacy policy </a></br>';  
   newcontentAbc.style.fontSize='8px';
   document.getElementsByClassName("buttonWrapper embeddedServiceSidebarForm")[0].appendChild(newcontentAbc);
   i++;
   }
   let newcontentbreak = document.createElement('a');
   newcontentbreak .innerHTML='</br></br>';  
    document.getElementsByClassName("uiInput uiInputSelect uiInput--default uiInput--select")[1].appendChild(newcontentbreak);
});
 embedded_svc.addEventHandler("afterMinimize", function(data) {

 
  console.log('afterminimize');
  });
 
  embedded_svc.addEventHandler("onClickSubmitButton", function(data) {
 i=0;
 });
 
   embedded_svc.addEventHandler("afterDestroy", function(data) {
 i=0;
 });
 
 

//

        embedded_svc.settings.enabledFeatures = ['LiveAgent'];
        embedded_svc.settings.entryFeature = 'LiveAgent';
        

        embedded_svc.init(
            'https://ingredion.my.salesforce.com',
            'https://www.myingredion.com/',
            gslbBaseURL,
            '00D30000000mNMR',
            'NA_inside_Lead_Sales',
            {
                baseLiveAgentContentURL: 'https://c.la13-core1.sfdc-lywfpd.salesforceliveagent.com/content',
                deploymentId: '5723x000000k9bm',
                buttonId: '5733x000000TPdJ',
                baseLiveAgentURL: 'https://d.la13-core1.sfdc-lywfpd.salesforceliveagent.com/chat',
                eswLiveAgentDevName: 'EmbeddedServiceLiveAgent_Parent04I3x000000CaRCEA0_184f206b30a',
                isOfflineSupportEnabled: true
            }
        );
    };

    if (!window.embedded_svc) {
        var s = document.createElement('script');
        s.setAttribute('src', 'https://ingredion.my.salesforce.com/embeddedservice/5.0/esw.min.js');
        s.onload = function() {
            initESW(null);
        };
        document.body.appendChild(s);
    } else {
        initESW('https://service.force.com');
    }
