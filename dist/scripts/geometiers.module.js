'use strict';

/**
 * @ngdoc overview
 * @name geometiersmodulejsApp
 * @description
 * # geometiersmodulejsApp
 *
 * Main module of the application.
 */
angular
  .module('geometiersmodulejsApp', [
    'ngResource',
    'ngRoute'
  ])
  .constant("config", {
        "API": "http://qualimetiers.fr/api",
  })
  // retourne la date d'aujourd'hui moins le nombre d'année
  .filter('removeyear', function() {

        return function(annee) {

          var n = 0;

          if(annee)
            n = annee;

          var now = new Date();
          return new Date(now.setFullYear(now.getFullYear() - n));

        }  

  })
  .filter('formatfilter', ["$filter", function($filter) {

      return function(str,reverse) {

        var now = new Date();
        var txt = "";

        var corres = [
          {name:'nbrentr',value:'Établissements'},
          {name:'salaries',value:'Avec des salariés'},
          {name:'apprentis',value:'Avec des apprentis'},
          {name:'conjoints',value:'Avec des conjoints'},
          {name:'actifs',value:'Avec des actifs'},
          {name:'tauxperennite',value:"Immatriculés en " + $filter('date')($filter('removeyear')(3),'yyyy')},
          {name:'tauxstabilite',value:"Immatriculés avant " + $filter('date')($filter('removeyear')(5),'yyyy')},
          {name:'evolcreation',value:"En activité en " + $filter('date')($filter('removeyear')(1),'yyyy')},
          {name:'evolcreation-2',value:"En activité en " + $filter('date')($filter('removeyear')(2),'yyyy')},
          {name:'evolcreation-3',value:"En activité en " + $filter('date')($filter('removeyear')(3),'yyyy')},
          {name:'evolcreation-4',value:"En activité en " + $filter('date')($filter('removeyear')(4),'yyyy')},
          {name:'evolcreation-5',value:"En activité en " + $filter('date')($filter('removeyear')(5),'yyyy')},
        ]

        if(reverse){
           corres.forEach(function(element) {
            if(str == element.value)
              txt = element.name;return;
           });
        }
        else {
           corres.forEach(function(element) {
            if(str == element.name)
              txt = element.value;return;
          });
        }
       

        return txt;
      }

  }])  
  .run(["$rootScope", "$timeout", function ($rootScope, $timeout) {  
   $rootScope.$on('$viewContentLoaded', function(event) {
      $timeout(function() {
         // refresh MDL select IMPORTANT
              getmdlSelect.init("div.getmdl-select");
              componentHandler.upgradeAllRegistered();
      }, 0);
    });
}])

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:leafletGeometiers
 * @description
 * # leafletGeometiers
 */
angular.module('geometiersmodulejsApp')
  .directive('leafletGeometiers', ["Webservice", "tools", "Filtre", function (Webservice,tools,Filtre) {
    	  return {
	      
	    	restrict: 'EA',
	        replace: true,
	        templateUrl:'views/geometiersmodulejs.map.html',
	        scope : {
	    		
	    		zoneSelect       : '=parent',
	        	decoupage        : '=',
	        	navigation		 : '=',
	            decoupe   		 : '=',
	            legende          : '=',
	    		zoom			 : '=',
	         	loading			 : '=',
	         	statistique		 : '=',
	         	update			 : '&',
	         	gps              : '=',

	        },
	    	
	    	
	        controller: ["$scope", "$element", function($scope, $element) {
	        	
	        	this.initialiser = function(){
	        		
	        		Filtre.init();
		        	Filtre.setDecoupage($scope.decoupage);
		        	Filtre.setLocalisation({
		        		name 	:$scope.zoneSelect.name, 
	            		value	:$scope.zoneSelect.value
	            	});
		        	var params = Filtre.params();
	        		params.push({name:'action',value:'initialiser'});	
	        		
	        		$scope.loading = true;

					Webservice.get(tools.arrayToObject(params),function(datas){
						 $scope.loading = false;
	            		 $element.data('geometiers').parent(datas); 
					})
	        		
	        	}

	        	this.dessiner = function(params, zone){
	        		
	        		$scope.loading = true;
	        		params.push({name:'action',value:'filtrer'});

	        		Webservice.get(tools.arrayToObject(params),function(datas){
						 $scope.loading = false;
	            		 $element.data('geometiers').dessiner(datas,zone);
					})

	        	}

	        	this.creerResultat = function(datas){
	        		var js = $element.data('geometiers');
	        		var lfiltres = tools.arrayToObject(js.settings.filtres);
	            	Filtre.setDecoupage(js.settings.decoupage.value);
	            	Filtre.setLocalisation({
	            		name :js.settings.zoneSelect.name, 
	            		value:js.settings.zoneSelect.value
	            	});
	            	// On initialise les filtres
	            	Filtre.setFiltres(lfiltres);
	            	// On initialise les nouveaux résultats 
	            	$scope.statistique = {
	      		            resultat : datas.resultat[0],// résultat de la donnée
	      		            chiffres : datas.chiffres,// chiffres clés
	      		            filtres  : lfiltres,       // critères sélectionnés
	      		            nom      : datas.titre[0], // nom territoire
	      		            type     : datas.titre[1],// type de territoire
	      		    };
	        	}

	        	this.localiser = function(zone){
	        		Filtre.setDecoupage('commune');
	        		Filtre.setLocalisation({
		        		name 	:$scope.zoneSelect.name, 
	            		value	:$scope.zoneSelect.value
	            	});
	        		$scope.loading = true;
	        		var params = Filtre.params();
	        		params.push({name:'action',value:'filtrer'});

	        		Webservice.get(tools.arrayToObject(params),function(datas){
						 $scope.loading = false;
	            		 $element.data('geometiers').rechercher(datas,zone);
					})
	        	}

	        }],
	        
	     
	        link: function (scope, element, attrs, ctrl) {

		        element.geometiers({
        	    	
        			opacity				    : 0,
        	    	zoom				    : scope.zoom.zoom,
        	    	maxZoom					: scope.zoom.maxzoom,
        	    	colorLayerContour       : '#FAFAFA',
        		    colorLayerContourOver   : '#FAFAFA',
        		    colorLayerBackground    : '#31313b',
        		    zoneSelect			    : scope.zoneSelect,
                    decoupage				: scope.decoupage,
                    lat						: scope.gps.lat,
                    lng						: scope.gps.lng,
                    decoupeControl			: scope.decoupe,
                    navigationControl		: scope.navigation,
                    legendeDisplay			: scope.legende,
                    
                    // Déclencher après que le carte soit redéssinée
        	        'initParent': function (params) {ctrl.dessiner(params);},
        	        // Déclencher après que le carte soit redéssinée
        	        'update': function (datas) {ctrl.creerResultat(datas);},
        	        // Déclencher après une sélection d'une zone
        	        'selectZone': function (params, zone) {ctrl.dessiner(params, zone);},
        	        // Déclencher après une sélection de découpage	
         	        'selectDecoupage': function (params) {ctrl.dessiner(params);},
        	        // Déclencher après une sélection sur le breadcrumb	
          	        'selectBreadcrumb': function (params) {ctrl.dessiner(params);}
        	        
        	    });

		        ctrl.initialiser();
	        
	        	// après changement de filtre
	        	scope.$on('update.filtres', function() {

	        		if(!angular.isDefined(Filtre.getByName('siret'))){
	        			Filtre.removeFiltre('siret');
				    	element.data('geometiers').setFiltres(tools.objectToArray(Filtre.filtres));
	        			ctrl.dessiner(Filtre.params());
				    }
	        	})

	        	// après changement de localisation par la recherche
	        	scope.$on('update.location', function() {
	        		ctrl.localiser(Filtre.localisation);
	        	})

	        }

	  };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name geometiersmodulejsApp.Filtre
 * @description
 * # Filtre
 * Factory in the geometiersmodulejsApp.
 */
angular.module('geometiersmodulejsApp')
  .factory('Filtre', ["tools", "$rootScope", "$timeout", function (tools,$rootScope,$timeout) {
   
    var factory = {
      
      // liste de filtres
      filtres : {},
      
      // localisation de la recherche
      localisation : undefined,
      
      // découpage
      decoupage : undefined,
    
      // initialise le service avec des valeurs par défaut
      init : function(){
        factory.decoupage = 'commune';
        factory.localisation = {name:'departement', value:'1'};
        factory.filtres = {};
      },
      
      // notification de MAJ
      update : function(){

        $timeout(function () {
          $rootScope.$broadcast('update.filtres');
         },1);
        
      },
      
      // notification de MAJ
      updateLocation : function(){
        $timeout(function () {
          $rootScope.$broadcast('update.location');
         },1);
        
      },
      
      // initialise un découpage
      setDecoupage : function(d){
        factory.decoupage = d;
      },
      
      // initialise une localisation
      setLocalisation : function(l){
        factory.localisation = l;
      },
      
      // initialise la liste de filtre
      setFiltres : function(f){
        factory.filtres = f;
      },
      
      // ajoute un nouveau filtre à la liste de trie
      addFiltre : function(f){
        factory.filtres[f.name] = f.value;
      },
      
      getByName : function(n) {
        return factory.filtres[n];
      },
      
      // supprime un filtre de la liste de trie
      removeFiltre : function(f){
        delete factory.filtres[f];
      },
      
      // Supprime tous les filtres
      removeAllFiltres : function(){
        factory.filtres = {};
      },
      
      // Supprime la localisation
      removeLocalisation : function(){
        factory.localisation = undefined;
      },
      
      // retourne les paramètres à envoyer au Webservice
      params : function(){

        var filtres;
        
        filtres = tools.objectToArray(factory.filtres);
        filtres.push({name:'decoupage',value:factory.decoupage}) 
        filtres.push(factory.localisation);
        
        return filtres;

      },
      
      // retourne une url correspondant aux paramètres de filtrage
      url : function(){
  
        var url = "";
        
        if(angular.isUndefined(factory.localisation))
          this.init();
        
        // si n°siret
        if(angular.isDefined(factory.getByName('siret')))
          url = '/artisans/' + factory.getByName('siret');
        else{

          url = 'map';
          url += '/'  + factory.localisation.name;
          url +=  '/' + factory.localisation.value; 
              if(!angular.isUndefined(factory.decoupage) 
              && factory.localisation.name != factory.decoupage)
              url += '/' + factory.decoupage; 
              
              if(!angular.isUndefined(factory.filtres))
              url += '?' + $.param(factory.filtres);
        }
        
        

        return url;
      },
      

  }

  return factory;
   
  }]);


  // FiltreBounds services
angular.module('geometiersmodulejsApp')
  .factory('FiltreBounds',
     ["$http", "$q", "$rootScope", "Filtre", "$httpParamSerializerJQLike", "tools", function ($http,$q,$rootScope,Filtre,$httpParamSerializerJQLike,tools){ 
  
  var factory = {

      zoom : 12,
      
      bounds : undefined,

      center : undefined,
      
      lat : 44.08766175177227,
      
      lon : 1.4003462409973145,
      
      page: 1,
      
      lieu: "MONTAUBAN",

      insideCommune: true,
      
      // initialise un découpage
      setCodeCommune : function(c){
        factory.codeCommune = c;
      },
      
      // initialise un découpage
      setBounds : function(b){
        factory.bounds = b;
        var bounds = angular.fromJson(b);
        factory.lat = (bounds._southWest.lat+bounds._northEast.lat)/2;
        factory.lon = (bounds._southWest.lng+bounds._northEast.lng)/2;
      },

      setCenter : function(b){
        
        var point = angular.fromJson(b);
        factory.center = point;
        factory.lat = point.coordinates[1];
        factory.lon = point.coordinates[0];

        //console.log(point);

      },
      
      // initialise avec les paramètres URL
      init : function(params) {

        var filtres = angular.copy(params);
        delete filtres.lat;
        delete filtres.lon;
        delete filtres.nomterritoire; 
        delete filtres.p; 
        delete filtres.zoom; 
        Filtre.setFiltres(filtres);


        if(angular.isDefined(params.nomterritoire) 
          && angular.isDefined(params.lat) 
          && angular.isDefined(params.lon)){

            factory.lat = params.lat;
          factory.lon = params.lon; 
          factory.lieu = params.nomterritoire;

        }

        if(angular.isDefined(params.zoom)){
          factory.zoom  = params.zoom;
        }

        if(angular.isDefined(params.p)){
          factory.page  = params.p; 
        }

      },

      // retourne les paramètres à envoyer au Webservice
      getParams : function(insideCommune){

        var params =  {
          bounds:factory.bounds,
          action:'filtrer', 
          art:1,
          insideCommune:insideCommune,
        }
  
        return angular.extend(params, Filtre.filtres);

      },
      
      // retourne une url correspondant aux paramètres de filtrage
      url : function(){
  
        var url = "";       
        
        if(angular.isDefined(factory.lieu) && angular.isDefined(factory.lat) && angular.isDefined(factory.lon)){
          
          url += '/' + factory.lieu;
          url += '/lat' ;
              url += '/' + factory.lat;
              url += '/lon' ;
              url += '/' + factory.lon;
              url += '/?p='+ factory.page;
              url += '&zoom='+ factory.zoom;
              
              if(!angular.isUndefined(Filtre.filtres)){
                url += '&'+ $httpParamSerializerJQLike(Filtre.filtres);
              }
              
        }

        return url;
      },
  }

  return factory;

}]);
'use strict';

/**
 * @ngdoc service
 * @name geometiersmodulejsApp.tools
 * @description
 * # tools
 * Factory in the geometiersmodulejsApp.
 */
angular.module('geometiersmodulejsApp')
  .factory('tools', function () {
    
    // Instance service
    var tools = {}
    
    // retourne un tableau d'objets sous la forme {name:'',value:''}
    tools.objectToArray = function(object){
      var array = [];
      $.each(object,function(key,value){
        array.push({name:key,value:value});})
      return array;
    }
    
    // retourne un object de type key : value 
    // comprenant les valeurs d'un tableau d'object passé en paramètre
    tools.arrayToObject = function(array){
       var object = {};
         $.each(array, function (key, obj) {
           object[obj.name] = obj.value
         })
         return object;
    }

    return tools;
    
  });

'use strict';

/**
 * @ngdoc service
 * @name geometiersmodulejsApp.Webservice
 * @description
 * # Webservice
 * Factory in the geometiersmodulejsApp.
 */
angular.module('geometiersmodulejsApp')
  .factory('Webservice', ["$resource", "config", function ($resource, config) {
    
     return $resource(config.API + '/carte/:action', null,
              {
                  get: {
                      method: "GET",
                      cache: true,
                  }

              });
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:searchLocation
 * @description
 * # searchLocation
 */
angular.module('geometiersmodulejsApp')
  .directive('searchLocation', ["$resource", "Filtre", "config", function ($resource,Filtre, config) {
    return {
      restrict: 'A',
        scope : {
    		zoneSelect       : '=parent',
    		type			 : '@type',
		    ngModel          : '=',
		   
        },
      link: function postLink(scope, element, attrs) {
        
      	var params,prop;
		var obj = function(name, value) {this.name = name;this.value = value;}
			
			
			//$(element).click(function () {});

			
        	$(element).autocomplete({
				
        		autoFocus: false,
	   		    minLength: 0,
	   		    delay: 400,
	   		    source : function(requete, reponse){
	   		    	
	   		    	params = {'action':'rechercher',
	   		    			'c':scope.zoneSelect.value,
	   		    			'd':scope.zoneSelect.name,
	   		    			't':scope.type,
	   		    			'q':$(element).val()}
	   		    	

	   		    	var propositions = $resource(config.API + '/search').query(params,
		   		    	 function(){reponse($.map(propositions.slice(0,15), function(objet){return objet;}));
					});
	   				
	   			},
	   			     
	   			// lors de la sélection d'une proposition
	   			select : function(event, ui){
	   	        	prop = ui.item;
	   	        	
	   	        	///////////////////////////////////////////////////////////////////////////////////
					// on recherche un établissement
					///////////////////////////////////////////////////////////////////////////////////
					if(angular.isDefined(prop.siret)){
						// On supprime tout les filtres quand on recherche un établissement
						Filtre.removeAllFiltres();
						Filtre.addFiltre(new obj('siret',prop.siret));
						Filtre.setLocalisation(new obj('commune',prop.code));
						Filtre.update();
					}
					
					///////////////////////////////////////////////////////////////////////////////////
					// on filtres les données
					///////////////////////////////////////////////////////////////////////////////////
					else if(angular.isDefined(prop.filtre)){
					
						if(prop.filtre == 'metier' || prop.filtre == 'secteur' || prop.filtre == 'codeaprm'){
							
							Filtre.removeFiltre('secteur');
							Filtre.removeFiltre('metier');
							Filtre.removeFiltre('codeaprm');
							Filtre.removeFiltre('siret');
		    		
						}

						Filtre.addFiltre(new obj(prop.filtre,prop.code));
						Filtre.update();
					}
					
					///////////////////////////////////////////////////////////////////////////////////
					// on localise une commune
					///////////////////////////////////////////////////////////////////////////////////
					else{
						Filtre.setLocalisation(new obj('commune',prop.code));
						Filtre.updateLocation();
					}
	   	
	   			},
	   			
	   			
	   			change: function (event, ui) {
	   			}, 
	   				
	   			// focus d'une proposition
	   			focus: function (event, ui) {

	   			}
	   				
	   			}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
	   		    	 item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(this.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");

	   		    	 // si location
	   		    	 if(angular.isUndefined(item.filtre)){

	   		    	 	return $("<li class='mdl-list__item'></li>")
	   		                    .data("item.autocomplete", item)
	   		                    .append("<span class='mdl-list__item-primary-content'><i class='material-icons'>&#xE0C8;</i>"+item.label+"</span></span>")
	   		                    .appendTo(ul);
	   		    	 }

	   		    	 else if(item.filtre === 'artisan'){
	   		    	 	 return $("<li class='mdl-list__item'></li>")
	   		                    .data("item.autocomplete", item)
	   		                    .append("<span class='mdl-list__item-primary-content'><i class='material-icons'>&#xE7FD;</i><span>"+item.label+"</span></span>")
	   		                    .appendTo(ul);
	   		    	 }
	   		    	 else{
	   		    	 	 return $("<li class='"+ item.filtre +"'></li>")
	   		                    .data("item.autocomplete", item)
	   		                    .append(item.label)
	   		                    .appendTo(ul);
	   		    	 }

	   			};



      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:filtreGeometiers
 * @description
 * # filtreGeometiers
 */
/*
var Metiers = $resource(config.API + '/search', {});
		Metiers.query({'action':'rechercher','c':1,'d':'departement'})
		    .$promise.then(function(metiers) {
			
					metiers.forEach(function(m) {
					  s += "<li class='mdl-menu__item' ng-show='showMetier("'+m.secteur+'")'>'+m.metier+'</li>";

					});
		    	
		      	scope.metiers = s;

		      	
		 });*/

angular.module('geometiersmodulejsApp')
  .directive('filtreGeometiers', ["config", "$resource", "Filtre", "tools", "$timeout", function (config, $resource, Filtre, tools, $timeout) {
    return {
      replace: true,
	  transclude: true,
	  templateUrl:'views/filtres-modal.html',
      restrict: 'E',
      scope: true,
      	
      link: function postLink(scope, element, attrs) {

     	// Retourne un objet filtre initialisé avec des valeurs par défaut pour les modals
		var defaultFiltres = function () {
			
			return {
				stats    : 'Établissements',
	    		secteur  : 'Alimentation',
	    		metier   : 'Tous les métiers...',
	    		debAge	 : '15 ans',
	    		finAge	 : '75 ans et plus',
	    		sexe	 : 'Homme',
	    		statut	 : 'Societé',
	    		qualif	 : 'Artisan',
	    		evolution : {
	    			type : 'debImmat',
	    			value: '1 an'
	    		}

			}
			
		}
		
		scope.filtres = defaultFiltres();

		$timeout(function() {
         // refresh MDL select IMPORTANT
              getmdlSelect.init("div.getmdl-select");
              componentHandler.upgradeAllRegistered();
      	}, 0);

		scope.addFiltre = function(name,value,update){

			var Obj = function(name, value) {
			    this.name = name;
			    this.value = value;
			}
			
			var nFiltre = new Obj(name,value);
			
			// on supprime les filtres concernant l'évolution si ça le concerne
			if(nFiltre.name == 'debImmat' || nFiltre.name == 'debRad'){
				Filtre.removeFiltre('debImmat');
				Filtre.removeFiltre('debRad');
			}
			
			else if(nFiltre.name == 'secteur' || nFiltre.name == 'metier'){
				Filtre.removeFiltre('codeaprm');
			}

			Filtre.addFiltre(nFiltre);
			
			if(update)Filtre.update();
	    }
	    
		// Modifie la liste des filtres, et met à jour les statistiques
		scope.update = function(values){
			angular.forEach(values, function(value, name) {
				scope.addFiltre(name, value);
			});
			Filtre.update();
		}
		
		// Affiche le métier en fonction du secteur sélectionné
		scope.showMetier = function(secteur){
			 return (scope.filtres.secteur == secteur);
		}
		
		// Initialise le metier quand le critère de secteur change
		scope.$watch('filtres.secteur',function(newVal,oldVal){
			scope.filtres.metier = 'Tous les métiers...';
		});

      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:dirGeometiers
 * @description
 * # dirGeometiers
 */
angular.module('geometiersmodulejsApp')
  .directive('dirGeometiers', ["$resource", "config", "Filtre", "Webservice", function ($resource, config, Filtre, Webservice) {
    return {
      replace: true,
      scope:{
          decoupage    : '@',
          zoom         : '=',
          parent       : '=',
          gps          : '=',
      },
      templateUrl: 'views/geometiersmodulejs.main.html',
      restrict: 'E',
      controller: ["$scope", "$element", function($scope, $element) {
        // Modifie le type de statistique à afficher
        $scope.update = function(type){
          $scope.statistique.filtres.stats = type;
          Filtre.update();
        }
      }]
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:resultatGeometiers
 * @description
 * # resultatGeometiers
 */
angular.module('geometiersmodulejsApp')
  .directive('resultatGeometiers', function () {
    return {
      replace: true,
	    templateUrl:'views/geometiersmodulejs.resultat.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

     
	    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	    var animationName = 'fadeIn';
	    
      	scope.$watch('statistique', function(){
      			element.addClass('animated ' + animationName).one(animationEnd, function() {
	            	element.removeClass('animated ' + animationName);
	        	});
      	})


      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:affichePins
 * @description
 * # affichePins
 */
angular.module('geometiersmodulejsApp')
  .directive('affichePins', ["Webservice", "tools", "Filtre", "FiltreBounds", "$window", function (Webservice,tools,Filtre,FiltreBounds,$window) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        
      	var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
	    var animationName = 'rubberBand';

      	scope.$watch('statistique', function(){
      		 
      		if(angular.isDefined(scope.statistique) && scope.statistique.type == 'Commune'){
      			element.trigger('mouseover');
      			element.addClass('active');
      			element.addClass('animated ' + animationName).one(animationEnd, function() {
	            	element.removeClass('animated ' + animationName);
	        	});
	        }	
	        else
	        	element.removeClass('active');
      	})


		element.bind('click', function() {
		     
				var params = Filtre.params();
			    params.push({name:'action',value:'filtrer'});

			    // seulement si la zone est de type commune
			    if(scope.statistique.type == 'Commune'){

			    	 Webservice.get(tools.arrayToObject(params)).$promise.then(

			                function(datas) {
				                // init filtreBounds
				                if(datas.features.length > 0)
				                FiltreBounds.setCenter(datas.features[0].properties.centre);
				                 
				                FiltreBounds.zoom = 15;
				                FiltreBounds.lieu = datas.statistique.titre[0];
				                FiltreBounds.page  = 1;

				                $window.open(FiltreBounds.url());

			               },function( error ){
			                    alert(error);
			               }
			    	)
			    }

		});
      }
    };
  }]);

'use strict';

/**
 * @ngdoc directive
 * @name geometiersmodulejsApp.directive:btnFiltres
 * @description
 * # btnFiltres
 */
angular.module('geometiersmodulejsApp')
  .directive('btnFiltres', ["Filtre", function (Filtre) {
    return {
      templateUrl: function(element, attr) { return attr.templateUrl ? attr.templateUrl : 'views/filtres-btn.html' },	
      restrict: 'EA',
      replace: true,
      link: function (scope, element, attrs) {
        
        // Supprime un groupe de filtres
        scope.supp = function(filtres,evt){
          evt.stopImmediatePropagation();
          angular.forEach(filtres, function(value) {
            Filtre.removeFiltre(value);
          });
          Filtre.update();
        }
        
      }
    };
  }]);

angular.module('geometiersmodulejsApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/filtres-btn.html',
    "<div class=\"groupbutton metier\"> <span class=\"mdl-chip\" ng-class=\"{'mdl-chip--deletable':statistique.filtres.secteur || statistique.filtres.metier || statistique.filtres.codeaprm}\" data-toggle=\"modal\" data-target=\"#metierModal\"> <span class=\"mdl-chip__text\">{{statistique.filtres.secteur?statistique.filtres.secteur:\"Métier\"}} <span ng-show=\"statistique.filtres.metier\">,{{statistique.filtres.metier}}</span> <span ng-show=\"!statistique.filtres.metier && statistique.filtres.codeaprm\">,{{statistique.filtres.codeaprm}}</span> </span> <button type=\"button\" class=\"mdl-chip__action\" ng-show=\"statistique.filtres.secteur || statistique.filtres.metier || statistique.filtres.codeaprm\" ng-click=\"supp(['secteur','metier','codeaprm'],$event)\"><i class=\"material-icons\">cancel</i></button> </span> <span class=\"mdl-chip\" ng-class=\"{'mdl-chip--deletable':statistique.filtres.statut}\" data-toggle=\"modal\" data-target=\"#statutModal\"> <span class=\"mdl-chip__text\">{{statistique.filtres.statut?statistique.filtres.statut:\"Statut\"}}</span> <button type=\"button\" class=\"mdl-chip__action\" ng-show=\"statistique.filtres.statut\" ng-click=\"supp(['statut'],$event);\"><i class=\"material-icons\">cancel</i></button> </span> <span class=\"mdl-chip\" ng-class=\"{'mdl-chip--deletable':statistique.filtres.qualif}\" data-toggle=\"modal\" data-target=\"#qualifModal\"> <span class=\"mdl-chip__text\">{{statistique.filtres.qualif?statistique.filtres.qualif:\"Qualification\"}}</span> <button type=\"button\" class=\"mdl-chip__action\" ng-show=\"statistique.filtres.qualif\" ng-click=\"supp(['qualif'],$event);\"><i class=\"material-icons\">cancel</i></button> </span> <span class=\"mdl-chip\" ng-class=\"{'mdl-chip--deletable':statistique.filtres.sexe}\" data-toggle=\"modal\" data-target=\"#sexeModal\"> <span class=\"mdl-chip__text\">{{statistique.filtres.sexe?statistique.filtres.sexe:\"Sexe\"}}</span> <button type=\"button\" class=\"mdl-chip__action\" ng-show=\"statistique.filtres.sexe\" ng-click=\"supp(['sexe'],$event);\"><i class=\"material-icons\">cancel</i></button> </span> <span class=\"mdl-chip\" ng-class=\"{'mdl-chip--deletable':statistique.filtres.debAge || statistiques.filtres.finAge}\" data-toggle=\"modal\" data-target=\"#ageModal\"> <span class=\"mdl-chip__text\">{{(statistique.filtres.debAge || statistiques.filtres.finAge)?statistique.filtres.debAge + \" à \" + statistique.filtres.finAge:\"Age\"}}</span> <button type=\"button\" ng-show=\"statistique.filtres.debAge || statistiques.filtres.finAge\" class=\"mdl-chip__action\" ng-click=\"supp(['debAge','finAge'],$event)\"><i class=\"material-icons\">cancel</i></button> </span> <span class=\"mdl-chip\" ng-class=\"{'mdl-chip--deletable':statistique.filtres.debImmat || statistique.filtres.debRad}\" data-toggle=\"modal\" data-target=\"#evolModal\"> <span class=\"mdl-chip__text\"> {{!(statistique.filtres.debRad || statistique.filtres.debImmat)?\"Création / Radiation\":\"\"}} {{statistique.filtres.debImmat?\"Immatriculé depuis \" + statistique.filtres.debImmat:\"\"}} {{statistique.filtres.debRad?\"Radié depuis \" + statistique.filtres.debRad:\"\"}} </span> <button type=\"button\" ng-show=\"statistique.filtres.debRad || statistique.filtres.debImmat\" ng-click=\"supp(['debImmat','debRad'],$event)\" class=\"mdl-chip__action\"><i class=\"material-icons\">cancel</i></button> </span> </div>"
  );


  $templateCache.put('views/filtres-modal.html',
    "<div id=\"ModalCloseAfterAction\"> <!--<div class=\"modal fade\" id=\"statsModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\">\r" +
    "\n" +
    "  <div class=\"modal-dialog\" role=\"document\">\r" +
    "\n" +
    "    <div class=\"modal-content\">\r" +
    "\n" +
    "     \r" +
    "\n" +
    "      <h4 class=\"mdl-dialog__title\">Statistique</h4>\r" +
    "\n" +
    "   \r" +
    "\n" +
    "    <div class=\"mdl-dialog__content\">\r" +
    "\n" +
    "      \r" +
    "\n" +
    "      \r" +
    "\n" +
    "     <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\">\r" +
    "\n" +
    "            <input class=\"mdl-textfield__input\" type=\"text\" id=\"stats\" name=\"stats\" value=\"{{filtres.stats}}\" ng-model='filtres.stats' readonly tabIndex=\"-1\">\r" +
    "\n" +
    "            <label for=\"stats\">\r" +
    "\n" +
    "                <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i>\r" +
    "\n" +
    "            </label>\r" +
    "\n" +
    "            <label for=\"stats\" class=\"mdl-textfield__label\">Type</label>\r" +
    "\n" +
    "            <ul for=\"stats\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\">\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'nbrentr' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'salaries' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'apprentis' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'conjoints' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'actifs' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'tauxperennite' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'tauxstabilite' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'evolcreation' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'evolcreation-2' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'evolcreation-3' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'evolcreation-4' | formatfilter }}</li>\r" +
    "\n" +
    "                <li class=\"mdl-menu__item\">{{ 'evolcreation-5' | formatfilter }}</li>\r" +
    "\n" +
    "              </ul>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"mdl-dialog__actions\">\r" +
    "\n" +
    "      <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"update({'stats':filtres.stats});\">Appliquer</button>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "      \r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>--> <div class=\"modal fade\" id=\"metierModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <h4 class=\"mdl-dialog__title\">Métiers</h4> <div class=\"mdl-dialog__content\"> <div id=\"secteur-filtre\" class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"secteur\" name=\"secteur\" value=\"{{filtres.secteur}}\" ng-model=\"filtres.secteur\" readonly tabindex=\"-1\"> <label for=\"secteur\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"secteur\" class=\"mdl-textfield__label\">Secteur</label> <ul for=\"secteur\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">Alimentation</li> <li class=\"mdl-menu__item\">Bâtiment</li> <li class=\"mdl-menu__item\">Fabrication</li> <li class=\"mdl-menu__item\">Services</li> </ul> </div> <div id=\"metier-filtre\" class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"metier\" value=\"{{filtres.metier}}\" ng-model=\"filtres.metier\" readonly tabindex=\"-1\"> <label for=\"metier\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"metier\" class=\"mdl-textfield__label\">Métiers</label> <ul for=\"metier\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">Tous les métiers...</li> <li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Ambulancier</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Bijoutier-Horloger</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Alimentation')\">Boucher</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Alimentation')\">Boulanger</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Carreleur</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Carrossier</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Céramiste</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Charpentier Couvreur</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Coiffeur à domicile</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Coiffeur en salon</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Contrôle technique</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Cordonnier</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Créateur textile</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Ebéniste</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Electricien</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Esthéticienne</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Fleuriste</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Garagiste automobile</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Imprimeur</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Maçon</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Mécanique agricole</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Mécanique industrielle</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Menuisier</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Nettoyage de bâtiment</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Opticien</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Peintre</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Photographe</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Plaquiste</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">Plombier chauffagiste</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Alimentation')\">Poissonnier</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Pressing Blanchisserie</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Prothésiste</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Réparateur informatique</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Alimentation')\">Restauration rapide</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Fabrication')\">Tailleur de pierres</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Services')\">Taxi</li><li class=\"mdl-menu__item\" ng-show=\"showMetier('Bâtiment')\">TP / Terrassier</li> </ul> </div> <div class=\"mdl-dialog__actions\"> <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"update({'secteur':filtres.secteur,'metier':filtres.metier});\">Appliquer</button> </div> <p class=\"mot\">ou</p> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label\"> <input search-location parent=\"{name: 'departement', value: '1'}\" type=\"aprm\" class=\"mdl-textfield__input\" type=\"text\" id=\"libelle\"> <label class=\"mdl-textfield__label\" for=\"libelle\">Libellé métier...</label> </div> </div> </div> </div> </div> <div class=\"modal fade\" id=\"statutModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <h4 class=\"mdl-dialog__title\">Régime et statut</h4> <div class=\"mdl-dialog__content\"> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"statut\" name=\"statut\" value=\"{{filtres.statut}}\" ng-model=\"filtres.statut\" readonly tabindex=\"-1\"> <label for=\"statut\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"statut\" class=\"mdl-textfield__label\">Statut juridique</label> <ul for=\"statut\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">Auto-entrepreneur</li> <li class=\"mdl-menu__item\">Entreprise individuelle</li> <li class=\"mdl-menu__item\">Société</li> </ul> </div> </div> <div class=\"mdl-dialog__actions\"> <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"update({'statut':filtres.statut});\">Appliquer</button> </div> </div> </div> </div> <div class=\"modal fade\" id=\"qualifModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <h4 class=\"mdl-dialog__title\">Qualification</h4> <div class=\"mdl-dialog__content\"> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"qualif\" name=\"qualif\" value=\"{{filtres.qualif}}\" ng-model=\"filtres.qualif\" readonly tabindex=\"-1\"> <label for=\"qualif\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"qualif\" class=\"mdl-textfield__label\">Titre de qualification</label> <ul for=\"qualif\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">Artisan</li> <li class=\"mdl-menu__item\">Maître artisan</li> <li class=\"mdl-menu__item\">Artisan en métiers d'art</li> <li class=\"mdl-menu__item\">Maître artisan en métiers d'art</li> <li class=\"mdl-menu__item\">Sans titre</li> </ul> </div> </div> <div class=\"mdl-dialog__actions\"> <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"update({'qualif':filtres.qualif});\">Appliquer</button> </div> </div> </div> </div> <div class=\"modal fade\" id=\"sexeModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <h4 class=\"mdl-dialog__title\">Dirigeant</h4> <div class=\"mdl-dialog__content\"> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"sexe\" name=\"sexe\" value=\"{{filtres.sexe}}\" ng-model=\"filtres.sexe\" readonly tabindex=\"-1\"> <label for=\"sexe\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"sexe\" class=\"mdl-textfield__label\"></label> <ul for=\"sexe\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">Homme</li> <li class=\"mdl-menu__item\">Femme</li> </ul> </div> </div> <div class=\"mdl-dialog__actions\"> <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"update({'sexe':filtres.sexe});\">Appliquer</button> </div> </div> </div> </div> <div class=\"modal fade\" id=\"ageModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <h4 class=\"mdl-dialog__title\">Age</h4> <div class=\"mdl-dialog__content\"> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\" ng-init=\"init()\"> <input class=\"mdl-textfield__input\" type=\"text\" name=\"debAge\" id=\"debAge\" value=\"{{filtres.debAge}}\" ng-model=\"filtres.debAge\" readonly tabindex=\"-1\"> <label for=\"debAge\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"debAge\" class=\"mdl-textfield__label\">De</label> <ul for=\"debAge\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">15 ans</li> <li class=\"mdl-menu__item\">20 ans</li> <li class=\"mdl-menu__item\">25 ans</li> <li class=\"mdl-menu__item\">30 ans</li> <li class=\"mdl-menu__item\">35 ans</li> <li class=\"mdl-menu__item\">40 ans</li> <li class=\"mdl-menu__item\">50 ans</li> <li class=\"mdl-menu__item\">55 ans</li> <li class=\"mdl-menu__item\">60 ans</li> <li class=\"mdl-menu__item\">65 ans</li> <li class=\"mdl-menu__item\">70 ans</li> <li class=\"mdl-menu__item\">75 ans et plus</li> </ul> </div> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\" ng-init=\"init()\"> <input class=\"mdl-textfield__input\" type=\"text\" name=\"finAge\" id=\"finAge\" value=\"{{filtres.finAge}}\" ng-model=\"filtres.finAge\" readonly tabindex=\"-1\"> <label for=\"finAge\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"finAge\" class=\"mdl-textfield__label\">à</label> <ul for=\"finAge\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">15 ans</li> <li class=\"mdl-menu__item\">20 ans</li> <li class=\"mdl-menu__item\">25 ans</li> <li class=\"mdl-menu__item\">30 ans</li> <li class=\"mdl-menu__item\">35 ans</li> <li class=\"mdl-menu__item\">40 ans</li> <li class=\"mdl-menu__item\">50 ans</li> <li class=\"mdl-menu__item\">55 ans</li> <li class=\"mdl-menu__item\">60 ans</li> <li class=\"mdl-menu__item\">65 ans</li> <li class=\"mdl-menu__item\">70 ans</li> <li class=\"mdl-menu__item\">75 ans et plus</li> </ul> </div> </div> <div class=\"mdl-dialog__actions\"> <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"update({'debAge':filtres.debAge,'finAge':filtres.finAge})\">Appliquer</button> </div> </div> </div> </div> <div class=\"modal fade\" id=\"evolModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <h4 class=\"mdl-dialog__title\">&Eacute;volution</h4> <div class=\"mdl-dialog__content\"> <p>&Eacute;volution des entreprises à partir de la date d'aujourd'hui</p> <label class=\"mdl-radio mdl-js-radio\" for=\"inputImmat\"> <input type=\"radio\" id=\"inputImmat\" class=\"mdl-radio__button\" name=\"evolution\" ng-model=\"filtres.evolution.type\" value=\"debImmat\" checked> <span class=\"mdl-radio__label\">Immatriculation</span> </label> <label class=\"mdl-radio mdl-js-radio\" for=\"inputRad\"> <input type=\"radio\" id=\"inputRad\" class=\"mdl-radio__button\" name=\"evolution\" ng-model=\"filtres.evolution.type\" value=\"debRad\"> <span class=\"mdl-radio__label\">Radiation</span> </label> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"evolution\" ng-model=\"filtres.evolution.value\" value=\"1 an\" readonly tabindex=\"-1\"> <label for=\"evolution\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <label for=\"evolution\" class=\"mdl-textfield__label\">Depuis moins de </label> <ul for=\"evolution\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item\">1 an</li> <li class=\"mdl-menu__item\">2 ans</li> <li class=\"mdl-menu__item\">3 ans</li> <li class=\"mdl-menu__item\">4 ans</li> <li class=\"mdl-menu__item\">5 ans</li> </ul> </div> </div> <div class=\"mdl-dialog__actions\"> <button type=\"button\" class=\"mdl-button mdl-button--primary btnAppliquer\" ng-click=\"addFiltre(filtres.evolution.type,filtres.evolution.value,true);\">Appliquer</button> </div> </div> </div> </div> </div>"
  );


  $templateCache.put('views/geometiersmodulejs.main.html',
    "<main class=\"main-container mdl-layout__content\" ng-class=\"{'Alimentation':'blue', 'Services':'green', 'Bâtiment':'orange', 'Fabrication':'red'}[statistique.filtres.secteur]\"> <div class=\"container_preloader\" ng-show=\"loading\"><img class=\"preloader\" src=\"images/loaderco.gif\"></div> <div id=\"opaque-modal\" ng-class=\"{'visible':loading}\"></div> <div class=\"content-map\"> <leaflet-geometiers></leaflet-geometiers> </div> <div class=\"content-resultat\"> <resultat-geometiers></resultat-geometiers> </div> </main>"
  );


  $templateCache.put('views/geometiersmodulejs.map.html',
    "<div id=\"map\" statistique=\"statistique\" loading=\"loading\" zoom=\"zoom\" gps=\"gps\" parent=\"parent\" decoupage=\"decoupage\" decoupe=\"{class:'mdl-menu--bottom-left'}\" navigation=\"true\" legende=\"true\"> <div id=\"bar-jq\"> <div id=\"jq-dropdown-navigation\"></div> <div id=\"jq-dropdown-decoupe\"></div> <button id=\"btn-pins\" class=\"mdl-button mdl-js-button mdl-button--icon\" affiche-pins> <i class=\"material-icons\">{{statistique.type == 'Commune'?\"&#xE0C8;\":\"&#xE0C7;\"}}</i> </button> <div class=\"mdl-tooltip mdl-tooltip--large mdl-tooltip--right\" for=\"btn-pins\">Afficher les établissements</div> </div> </div>"
  );


  $templateCache.put('views/geometiersmodulejs.resultat.html',
    "<div id=\"stats-resultat\"> <div id=\"titre-resultat\" class=\"mdl-cell mdl-cell--12-col\"> <h3 ng-bind=\"statistique.type\"></h3> <h1 ng-bind=\"statistique.nom\"></h1> </div> <div id=\"nbr-resultat\" class=\"mdl-cell mdl-cell--12-col\"> <span ng-show=\"statistique.resultat._valeur != null\" class=\"chiffre\" ng-bind=\"statistique.resultat._valeur\"></span> <span ng-show=\"statistique.resultat._valeur != null\" class=\"percent\" ng-bind=\"statistique.resultat._type\"></span> <span ng-show=\"statistique.resultat._valeur == null\" class=\"chiffre error\">Pas d'établissement</span> </div> <div id=\"type-resultat\" class=\"mdl-cell mdl-cell--12-col\"> <div class=\"mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select\"> <input class=\"mdl-textfield__input\" type=\"text\" id=\"typestat\" ng-model=\"statistique.resultat._nom\" value=\"Établissements\" readonly tabindex=\"-1\"> <label for=\"typestat\"> <i class=\"mdl-icon-toggle__label material-icons\">keyboard_arrow_down</i> </label> <ul for=\"typestat\" class=\"mdl-menu mdl-menu--bottom-left mdl-js-menu\"> <li class=\"mdl-menu__item mdl-menu__item--full-bleed-divider\" ng-click=\"update('nbrentr')\">Établissements</li> <li class=\"mdl-menu__item\" ng-click=\"update('salaries')\">Salariés</li> <li class=\"mdl-menu__item\" ng-click=\"update('apprentis')\">Apprentis</li> <li class=\"mdl-menu__item\" ng-click=\"update('conjoints')\">Conjoints</li> <li class=\"mdl-menu__item mdl-menu__item--full-bleed-divider\" ng-click=\"update('actifs')\">Tous les actifs</li> <li class=\"mdl-menu__item\" ng-click=\"update('agemoyen')\">Age moyen</li> <li class=\"mdl-menu__item mdl-menu__item--full-bleed-divider\" ng-click=\"update('densiteh')\">Densité artisanale</li> <li class=\"mdl-menu__item\" ng-click=\"update('tauxperennite')\">Taux de pérennité</li> <li class=\"mdl-menu__item\" ng-click=\"update('tauxstabilite')\">Taux de maturité</li> <li class=\"mdl-menu__item\" ng-click=\"update('evolcreation')\">Taux d'évolution à 1 an</li> <li class=\"mdl-menu__item\" ng-click=\"update('evolcreation-2')\">Taux d'évolution à 2 ans</li> <li class=\"mdl-menu__item\" ng-click=\"update('evolcreation-3')\">Taux d'évolution à 3 ans</li> <li class=\"mdl-menu__item\" ng-click=\"update('evolcreation-4')\">Taux d'évolution à 4 ans</li> <li class=\"mdl-menu__item\" ng-click=\"update('evolcreation-5')\">Taux d'évolution à 5 ans</li> </ul> </div> <p class=\"info\" ng-bind=\"statistique.resultat._info\"></p> </div> <ul class=\"chiffrescles mdl-list\"> <li class=\"mdl-list__item\" ng-repeat=\"chiffre in statistique.chiffres\"> <span class=\"mdl-list__item-primary-content\" ng-bind=\"chiffre._nom\"></span> <span class=\"mdl-list__item-secondary-content\" ng-bind=\"chiffre._valeur\"></span> </li> </ul> <btn-filtres></btn-filtres> </div>"
  );

}]);
