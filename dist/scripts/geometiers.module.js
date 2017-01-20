"use strict";angular.module("geometiersmodulejsApp",["ngResource","ngRoute"]).constant("config",{API:"http://localhost/frameworkgeo/api"}).run(["$rootScope","$timeout",function(a,b){a.$on("$viewContentLoaded",function(a){b(function(){getmdlSelect.init("div.getmdl-select"),componentHandler.upgradeAllRegistered()},0)})}]),angular.module("geometiersmodulejsApp").directive("leafletGeometiers",["Webservice","tools","Filtre",function(a,b,c){return{restrict:"EA",replace:!0,templateUrl:"views/geometiersmodulejs.map.html",scope:{zoneSelect:"=parent",decoupage:"@",navigation:"=",decoupe:"=",legende:"=",zoom:"=",loading:"=",statistique:"=",update:"&",gps:"="},controller:["$scope","$element",function(d,e){this.initialiser=function(){c.init(),c.setDecoupage(d.decoupage),c.setLocalisation({name:d.zoneSelect.name,value:d.zoneSelect.value});var f=c.params();f.push({name:"action",value:"initialiser"}),d.loading=!0,a.get(b.arrayToObject(f),function(a){d.loading=!1,e.data("geometiers").parent(a)})},this.dessiner=function(c,f){d.loading=!0,c.push({name:"action",value:"filtrer"}),a.get(b.arrayToObject(c),function(a){d.loading=!1,e.data("geometiers").dessiner(a,f)})},this.creerResultat=function(a){var f=e.data("geometiers"),g=b.arrayToObject(f.settings.filtres);c.setDecoupage(f.settings.decoupage.value),c.setLocalisation({name:f.settings.zoneSelect.name,value:f.settings.zoneSelect.value}),c.setFiltres(g),d.statistique={resultat:a.resultat[0],chiffres:a.chiffres,filtres:g,nom:a.titre[0],type:a.titre[1]}},this.localiser=function(f){c.setDecoupage("commune"),c.setLocalisation({name:d.zoneSelect.name,value:d.zoneSelect.value}),d.loading=!0;var g=c.params();g.push({name:"action",value:"filtrer"}),a.get(b.arrayToObject(g),function(a){d.loading=!1,e.data("geometiers").rechercher(a,f)})}}],link:function(a,d,e,f){d.geometiers({opacity:0,zoom:a.zoom.zoom,maxZoom:a.zoom.maxzoom,colorLayerContour:"#FAFAFA",colorLayerContourOver:"#FAFAFA",colorLayerBackground:"#31313b",zoneSelect:a.zoneSelect,decoupage:a.decoupage,lat:a.gps.lat,lng:a.gps.lng,decoupeControl:a.decoupe,navigationControl:a.navigation,legendeDisplay:a.legende,initParent:function(a){f.dessiner(a)},update:function(a){f.creerResultat(a)},selectZone:function(a,b){f.dessiner(a,b)},selectDecoupage:function(a){f.dessiner(a)},selectBreadcrumb:function(a){f.dessiner(a)}}),f.initialiser(),a.$on("update.filtres",function(){angular.isDefined(c.getByName("siret"))||(c.removeFiltre("siret"),d.data("geometiers").setFiltres(b.objectToArray(c.filtres)),f.dessiner(c.params()))}),a.$on("update.location",function(){f.localiser(c.localisation)})}}}]),angular.module("geometiersmodulejsApp").factory("Filtre",["tools","$rootScope","$timeout",function(a,b,c){var d={filtres:{},localisation:void 0,decoupage:void 0,init:function(){d.decoupage="commune",d.localisation={name:"departement",value:"1"},d.filtres={}},update:function(){c(function(){b.$broadcast("update.filtres")},1)},updateLocation:function(){c(function(){b.$broadcast("update.location")},1)},setDecoupage:function(a){d.decoupage=a},setLocalisation:function(a){d.localisation=a},setFiltres:function(a){d.filtres=a},addFiltre:function(a){d.filtres[a.name]=a.value},getByName:function(a){return d.filtres[a]},removeFiltre:function(a){delete d.filtres[a]},removeAllFiltres:function(){d.filtres={}},removeLocalisation:function(){d.localisation=void 0},params:function(){var b;return b=a.objectToArray(d.filtres),b.push({name:"decoupage",value:d.decoupage}),b.push(d.localisation),b},url:function(){var a="";return angular.isUndefined(d.localisation)&&this.init(),angular.isDefined(d.getByName("siret"))?a="/artisans/"+d.getByName("siret"):(a="map",a+="/"+d.localisation.name,a+="/"+d.localisation.value,angular.isUndefined(d.decoupage)||d.localisation.name==d.decoupage||(a+="/"+d.decoupage),angular.isUndefined(d.filtres)||(a+="?"+$.param(d.filtres))),a}};return d}]),angular.module("geometiersmodulejsApp").factory("FiltreBounds",["$http","$q","$rootScope","Filtre","$httpParamSerializerJQLike","tools",function(a,b,c,d,e,f){var g={zoom:12,bounds:void 0,center:void 0,lat:44.08766175177227,lon:1.4003462409973144,page:1,lieu:"MONTAUBAN",insideCommune:!0,setCodeCommune:function(a){g.codeCommune=a},setBounds:function(a){g.bounds=a;var b=angular.fromJson(a);g.lat=(b._southWest.lat+b._northEast.lat)/2,g.lon=(b._southWest.lng+b._northEast.lng)/2},setCenter:function(a){var b=angular.fromJson(a);g.center=b,g.lat=b.coordinates[1],g.lon=b.coordinates[0]},init:function(a){var b=angular.copy(a);delete b.lat,delete b.lon,delete b.nomterritoire,delete b.p,delete b.zoom,d.setFiltres(b),angular.isDefined(a.nomterritoire)&&angular.isDefined(a.lat)&&angular.isDefined(a.lon)&&(g.lat=a.lat,g.lon=a.lon,g.lieu=a.nomterritoire),angular.isDefined(a.zoom)&&(g.zoom=a.zoom),angular.isDefined(a.p)&&(g.page=a.p)},getParams:function(a){var b={bounds:g.bounds,action:"filtrer",art:1,insideCommune:a};return angular.extend(b,d.filtres)},url:function(){var a="";return angular.isDefined(g.lieu)&&angular.isDefined(g.lat)&&angular.isDefined(g.lon)&&(a+="/"+g.lieu,a+="/lat",a+="/"+g.lat,a+="/lon",a+="/"+g.lon,a+="/?p="+g.page,a+="&zoom="+g.zoom,angular.isUndefined(d.filtres)||(a+="&"+e(d.filtres))),a}};return g}]),angular.module("geometiersmodulejsApp").factory("tools",function(){var a={};return a.objectToArray=function(a){var b=[];return $.each(a,function(a,c){b.push({name:a,value:c})}),b},a.arrayToObject=function(a){var b={};return $.each(a,function(a,c){b[c.name]=c.value}),b},a}),angular.module("geometiersmodulejsApp").factory("Webservice",["$resource","config",function(a,b){return a(b.API+"/carte/:action",null,{get:{method:"GET",cache:!0}})}]),angular.module("geometiersmodulejsApp").directive("searchLocation",["$resource","Filtre","config",function(a,b,c){return{restrict:"A",scope:{zoneSelect:"=parent",type:"@type",ngModel:"="},link:function(d,e,f){var g,h,i=function(a,b){this.name=a,this.value=b};$(e).autocomplete({autoFocus:!1,minLength:0,delay:400,source:function(b,f){g={action:"rechercher",c:d.zoneSelect.value,d:d.zoneSelect.name,t:d.type,q:$(e).val()};var h=a(c.API+"/search").query(g,function(){f($.map(h.slice(0,15),function(a){return a}))})},select:function(a,c){h=c.item,angular.isDefined(h.siret)?(b.removeAllFiltres(),b.addFiltre(new i("siret",h.siret)),b.setLocalisation(new i("commune",h.code)),b.update()):angular.isDefined(h.filtre)?(("metier"==h.filtre||"secteur"==h.filtre||"codeaprm"==h.filtre)&&(b.removeFiltre("secteur"),b.removeFiltre("metier"),b.removeFiltre("codeaprm"),b.removeFiltre("siret")),b.addFiltre(new i(h.filtre,h.code)),b.update()):(b.setLocalisation(new i("commune",h.code)),b.updateLocation())},change:function(a,b){},focus:function(a,b){}}).data("ui-autocomplete")._renderItem=function(a,b){return b.label=b.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+$.ui.autocomplete.escapeRegex(this.term)+")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>"),angular.isUndefined(b.filtre)?$("<li class='mdl-list__item'></li>").data("item.autocomplete",b).append("<span class='mdl-list__item-primary-content'><i class='material-icons'>&#xE0C8;</i>"+b.label+"</span></span>").appendTo(a):"artisan"===b.filtre?$("<li class='mdl-list__item'></li>").data("item.autocomplete",b).append("<span class='mdl-list__item-primary-content'><i class='material-icons'>&#xE7FD;</i><span>"+b.label+"</span></span>").appendTo(a):$("<li class='"+b.filtre+"'></li>").data("item.autocomplete",b).append(b.label).appendTo(a)}}}}]),angular.module("geometiersmodulejsApp").directive("filtreGeometiers",["config","$resource","Filtre","tools","$timeout",function(a,b,c,d,e){return{replace:!0,transclude:!0,templateUrl:"views/filtres-modal.html",restrict:"E",scope:!0,link:function(a,b,d){var f=function(){return{secteur:"Alimentation",metier:"Tous les métiers...",debAge:"15 ans",finAge:"75 ans et plus",sexe:"Homme",statut:"Societé",qualif:"Artisan",evolution:{type:"debImmat",value:"1 an"}}};a.filtres=f(),e(function(){getmdlSelect.init("div.getmdl-select"),componentHandler.upgradeAllRegistered()},0),a.addFiltre=function(a,b,d){var e=function(a,b){this.name=a,this.value=b},f=new e(a,b);"debImmat"==f.name||"debRad"==f.name?(c.removeFiltre("debImmat"),c.removeFiltre("debRad")):("secteur"==f.name||"metier"==f.name)&&c.removeFiltre("codeaprm"),c.addFiltre(f),d&&c.update()},a.update=function(b){angular.forEach(b,function(b,c){a.addFiltre(c,b)}),c.update()},a.showMetier=function(b){return a.filtres.secteur==b},a.$watch("filtres.secteur",function(b,c){a.filtres.metier="Tous les métiers..."})}}}]),angular.module("geometiersmodulejsApp").directive("dirGeometiers",["$resource","config","Filtre","Webservice",function(a,b,c,d){return{replace:!0,scope:{decoupage:"@",zoom:"=",parent:"=",gps:"="},templateUrl:"views/geometiersmodulejs.main.html",restrict:"E",controller:["$scope","$element",function(a,b){a.statistique={resultat:0,chiffres:"",filtres:[],nom:"",type:""},a.update=function(b){a.statistique.filtres.stats=b,c.update()},a.supp=function(a,b){b.stopImmediatePropagation(),angular.forEach(a,function(a){c.removeFiltre(a)}),c.update()}}]}}]),angular.module("geometiersmodulejsApp").directive("resultatGeometiers",function(){return{replace:!0,templateUrl:"views/geometiersmodulejs.resultat.html",restrict:"E",link:function(a,b,c){}}}),angular.module("geometiersmodulejsApp").directive("affichePins",["Webservice","tools","Filtre","FiltreBounds","$window",function(a,b,c,d,e){return{restrict:"A",link:function(f,g,h){g.bind("click",function(){var f=c.params();f.push({name:"action",value:"filtrer"}),a.get(b.arrayToObject(f)).$promise.then(function(a){a.features.length>0&&d.setCenter(a.features[0].properties.centre),d.zoom=15,d.lieu=a.statistique.titre[0],d.page=1,e.open("//qualimetiers.fr"+d.url())},function(a){alert(a)})})}}}]),angular.module("geometiersmodulejsApp").run(["$templateCache",function(a){a.put("views/affiche-pins.html",'<button class="mdl-button mdl-js-button mdl-js-ripple-effect" ng-show="statistique.type == \'Commune\'" ng-click="afficherPins()"> Voir les établissements </button>'),a.put("views/filtres-modal.html",'<div id="ModalCloseAfterAction"> <div class="modal fade" id="metierModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <h4 class="mdl-dialog__title">Métiers</h4> <div class="mdl-dialog__content"> <div id="secteur-filtre" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height"> <input class="mdl-textfield__input" type="text" id="secteur" name="secteur" value="{{filtres.secteur}}" ng-model="filtres.secteur" readonly tabindex="-1"> <label for="secteur"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="secteur" class="mdl-textfield__label">Secteur</label> <ul for="secteur" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">Alimentation</li> <li class="mdl-menu__item">Bâtiment</li> <li class="mdl-menu__item">Fabrication</li> <li class="mdl-menu__item">Services</li> </ul> </div> <div id="metier-filtre" class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select getmdl-select__fix-height"> <input class="mdl-textfield__input" type="text" id="metier" value="{{filtres.metier}}" ng-model="filtres.metier" readonly tabindex="-1"> <label for="metier"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="metier" class="mdl-textfield__label">Métiers</label> <ul for="metier" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">Tous les métiers...</li> <li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Ambulancier</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Bijoutier-Horloger</li><li class="mdl-menu__item" ng-show="showMetier(\'Alimentation\')">Boucher</li><li class="mdl-menu__item" ng-show="showMetier(\'Alimentation\')">Boulanger</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Carreleur</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Carrossier</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Céramiste</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Charpentier Couvreur</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Coiffeur à domicile</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Coiffeur en salon</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Contrôle technique</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Cordonnier</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Créateur textile</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Ebéniste</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Electricien</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Esthéticienne</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Fleuriste</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Garagiste automobile</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Imprimeur</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Maçon</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Mécanique agricole</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Mécanique industrielle</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Menuisier</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Nettoyage de bâtiment</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Opticien</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Peintre</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Photographe</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Plaquiste</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">Plombier chauffagiste</li><li class="mdl-menu__item" ng-show="showMetier(\'Alimentation\')">Poissonnier</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Pressing Blanchisserie</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Prothésiste</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Réparateur informatique</li><li class="mdl-menu__item" ng-show="showMetier(\'Alimentation\')">Restauration rapide</li><li class="mdl-menu__item" ng-show="showMetier(\'Fabrication\')">Tailleur de pierres</li><li class="mdl-menu__item" ng-show="showMetier(\'Services\')">Taxi</li><li class="mdl-menu__item" ng-show="showMetier(\'Bâtiment\')">TP / Terrassier</li> </ul> </div> <div class="mdl-dialog__actions"> <button type="button" class="mdl-button mdl-button--primary btnAppliquer" ng-click="update({\'secteur\':filtres.secteur,\'metier\':filtres.metier});">Appliquer</button> </div> <p class="mot">ou</p> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label"> <input search-location parent="{name: \'departement\', value: \'1\'}" type="aprm" class="mdl-textfield__input" type="text" id="libelle"> <label class="mdl-textfield__label" for="libelle">Libellé métier...</label> </div> </div> </div> </div> </div> <div class="modal fade" id="statutModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <h4 class="mdl-dialog__title">Régime et statut</h4> <div class="mdl-dialog__content"> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select"> <input class="mdl-textfield__input" type="text" id="statut" name="statut" value="{{filtres.statut}}" ng-model="filtres.statut" readonly tabindex="-1"> <label for="statut"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="statut" class="mdl-textfield__label">Statut juridique</label> <ul for="statut" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">Auto-entrepreneur</li> <li class="mdl-menu__item">Entreprise individuelle</li> <li class="mdl-menu__item">Société</li> </ul> </div> </div> <div class="mdl-dialog__actions"> <button type="button" class="mdl-button mdl-button--primary btnAppliquer" ng-click="update({\'statut\':filtres.statut});">Appliquer</button> </div> </div> </div> </div> <div class="modal fade" id="qualifModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <h4 class="mdl-dialog__title">Qualification</h4> <div class="mdl-dialog__content"> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select"> <input class="mdl-textfield__input" type="text" id="qualif" name="qualif" value="{{filtres.qualif}}" ng-model="filtres.qualif" readonly tabindex="-1"> <label for="qualif"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="qualif" class="mdl-textfield__label">Titre de qualification</label> <ul for="qualif" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">Artisan</li> <li class="mdl-menu__item">Maître artisan</li> <li class="mdl-menu__item">Artisan en métiers d\'art</li> <li class="mdl-menu__item">Maître artisan en métiers d\'art</li> <li class="mdl-menu__item">Sans titre</li> </ul> </div> </div> <div class="mdl-dialog__actions"> <button type="button" class="mdl-button mdl-button--primary btnAppliquer" ng-click="update({\'qualif\':filtres.qualif});">Appliquer</button> </div> </div> </div> </div> <div class="modal fade" id="sexeModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <h4 class="mdl-dialog__title">Dirigeant</h4> <div class="mdl-dialog__content"> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select"> <input class="mdl-textfield__input" type="text" id="sexe" name="sexe" value="{{filtres.sexe}}" ng-model="filtres.sexe" readonly tabindex="-1"> <label for="sexe"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="sexe" class="mdl-textfield__label"></label> <ul for="sexe" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">Homme</li> <li class="mdl-menu__item">Femme</li> </ul> </div> </div> <div class="mdl-dialog__actions"> <button type="button" class="mdl-button mdl-button--primary btnAppliquer" ng-click="update({\'sexe\':filtres.sexe});">Appliquer</button> </div> </div> </div> </div> <div class="modal fade" id="ageModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <h4 class="mdl-dialog__title">Age</h4> <div class="mdl-dialog__content"> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select" ng-init="init()"> <input class="mdl-textfield__input" type="text" name="debAge" id="debAge" value="{{filtres.debAge}}" ng-model="filtres.debAge" readonly tabindex="-1"> <label for="debAge"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="debAge" class="mdl-textfield__label">De</label> <ul for="debAge" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">15 ans</li> <li class="mdl-menu__item">20 ans</li> <li class="mdl-menu__item">25 ans</li> <li class="mdl-menu__item">30 ans</li> <li class="mdl-menu__item">35 ans</li> <li class="mdl-menu__item">40 ans</li> <li class="mdl-menu__item">50 ans</li> <li class="mdl-menu__item">55 ans</li> <li class="mdl-menu__item">60 ans</li> <li class="mdl-menu__item">65 ans</li> <li class="mdl-menu__item">70 ans</li> <li class="mdl-menu__item">75 ans et plus</li> </ul> </div> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select" ng-init="init()"> <input class="mdl-textfield__input" type="text" name="finAge" id="finAge" value="{{filtres.finAge}}" ng-model="filtres.finAge" readonly tabindex="-1"> <label for="finAge"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="finAge" class="mdl-textfield__label">à</label> <ul for="finAge" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">15 ans</li> <li class="mdl-menu__item">20 ans</li> <li class="mdl-menu__item">25 ans</li> <li class="mdl-menu__item">30 ans</li> <li class="mdl-menu__item">35 ans</li> <li class="mdl-menu__item">40 ans</li> <li class="mdl-menu__item">50 ans</li> <li class="mdl-menu__item">55 ans</li> <li class="mdl-menu__item">60 ans</li> <li class="mdl-menu__item">65 ans</li> <li class="mdl-menu__item">70 ans</li> <li class="mdl-menu__item">75 ans et plus</li> </ul> </div> </div> <div class="mdl-dialog__actions"> <button type="button" class="mdl-button mdl-button--primary btnAppliquer" ng-click="update({\'debAge\':filtres.debAge,\'finAge\':filtres.finAge})">Appliquer</button> </div> </div> </div> </div> <div class="modal fade" id="evolModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"> <div class="modal-dialog" role="document"> <div class="modal-content"> <h4 class="mdl-dialog__title">&Eacute;volution</h4> <div class="mdl-dialog__content"> <p>&Eacute;volution des entreprises à partir de la date d\'aujourd\'hui</p> <label class="mdl-radio mdl-js-radio" for="inputImmat"> <input type="radio" id="inputImmat" class="mdl-radio__button" name="evolution" ng-model="filtres.evolution.type" value="debImmat" checked> <span class="mdl-radio__label">Immatriculation</span> </label> <label class="mdl-radio mdl-js-radio" for="inputRad"> <input type="radio" id="inputRad" class="mdl-radio__button" name="evolution" ng-model="filtres.evolution.type" value="debRad"> <span class="mdl-radio__label">Radiation</span> </label> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select"> <input class="mdl-textfield__input" type="text" id="evolution" ng-model="filtres.evolution.value" value="1 an" readonly tabindex="-1"> <label for="evolution"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <label for="evolution" class="mdl-textfield__label">Depuis moins de </label> <ul for="evolution" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item">1 an</li> <li class="mdl-menu__item">2 ans</li> <li class="mdl-menu__item">3 ans</li> <li class="mdl-menu__item">4 ans</li> <li class="mdl-menu__item">5 ans</li> </ul> </div> </div> <div class="mdl-dialog__actions"> <button type="button" class="mdl-button mdl-button--primary btnAppliquer" ng-click="addFiltre(filtres.evolution.type,filtres.evolution.value,true);">Appliquer</button> </div> </div> </div> </div> </div>'),a.put("views/geometiersmodulejs.main.html",'<div> <main class="main-container mdl-layout__content" ng-class="{\'Alimentation\':\'blue\', \'Services\':\'green\', \'Bâtiment\':\'orange\', \'Fabrication\':\'red\'}[statistique.filtres.secteur]"> <div class="container_preloader" ng-show="loading"><img class="preloader" src="images/loaderco.ea876374.gif"></div> <div id="opaque-modal" ng-class="{\'visible\':loading}"></div> <div class="content-map"> <leaflet-geometiers></leaflet-geometiers> </div> <div class="content-resultat"> <resultat-geometiers></resultat-geometiers> </div> </main> <filtre-geometiers></filtre-geometiers> </div>'),a.put("views/geometiersmodulejs.map.html",'<div id="map" statistique="statistique" loading="loading" zoom="zoom" gps="gps" parent="parent" decoupage="decoupage" decoupe="{class:\'mdl-menu--bottom-left\'}" navigation="true" legende="true"> <div id="bar-jq"> <div id="jq-dropdown-navigation"></div> <div id="jq-dropdown-decoupe"></div> <button id="btn-pins" class="mdl-button mdl-js-button mdl-button--icon" ng-class="{\'active animated rubberBand\': statistique.type == \'Commune\'}"> <i class="material-icons">{{statistique.type == \'Commune\'?"&#xE0C8;":"&#xE0C7;"}}</i> </button> <div class="mdl-tooltip mdl-tooltip--large mdl-tooltip--right" for="btn-pins">Afficher les établissements</div> </div> </div>'),a.put("views/geometiersmodulejs.resultat.html",'<div id="stats-resultat"> <div id="titre-resultat" class="mdl-cell mdl-cell--12-col"> <h3 ng-bind="statistique.type"></h3> <h1 ng-bind="statistique.nom"></h1> </div> <div id="nbr-resultat" class="mdl-cell mdl-cell--12-col"> <span ng-show="statistique.resultat._valeur != null" class="chiffre" ng-bind="statistique.resultat._valeur"></span> <span ng-show="statistique.resultat._valeur != null" class="percent" ng-bind="statistique.resultat._type"></span> <span ng-show="statistique.resultat._valeur == null" class="chiffre error">Pas d\'établissement</span> </div> <div id="type-resultat" class="mdl-cell mdl-cell--12-col"> <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label getmdl-select"> <input class="mdl-textfield__input" type="text" id="typestat" ng-model="statistique.resultat._nom" value="Établissements" readonly tabindex="-1"> <label for="typestat"> <i class="mdl-icon-toggle__label material-icons">keyboard_arrow_down</i> </label> <ul for="typestat" class="mdl-menu mdl-menu--bottom-left mdl-js-menu"> <li class="mdl-menu__item mdl-menu__item--full-bleed-divider" ng-click="update(\'nbrentr\')">Établissements</li> <li class="mdl-menu__item" ng-click="update(\'salaries\')">Salariés</li> <li class="mdl-menu__item" ng-click="update(\'apprentis\')">Apprentis</li> <li class="mdl-menu__item" ng-click="update(\'conjoints\')">Conjoints</li> <li class="mdl-menu__item mdl-menu__item--full-bleed-divider" ng-click="update(\'actifs\')">Tous les actifs</li> <li class="mdl-menu__item" ng-click="update(\'agemoyen\')">Age moyen</li> <li class="mdl-menu__item mdl-menu__item--full-bleed-divider" ng-click="update(\'densiteh\')">Densité artisanale</li> <li class="mdl-menu__item" ng-click="update(\'tauxperennite\')">Taux de pérennité</li> <li class="mdl-menu__item" ng-click="update(\'tauxstabilite\')">Taux de maturité</li> <li class="mdl-menu__item" ng-click="update(\'evolcreation\')">Taux d\'évolution à 1 an</li> <li class="mdl-menu__item" ng-click="update(\'evolcreation-2\')">Taux d\'évolution à 2 ans</li> <li class="mdl-menu__item" ng-click="update(\'evolcreation-3\')">Taux d\'évolution à 3 ans</li> <li class="mdl-menu__item" ng-click="update(\'evolcreation-4\')">Taux d\'évolution à 4 ans</li> <li class="mdl-menu__item" ng-click="update(\'evolcreation-5\')">Taux d\'évolution à 5 ans</li> </ul> </div> <p class="info" ng-bind="statistique.resultat._info"></p> </div> <ul class="chiffrescles mdl-list"> <li class="mdl-list__item" ng-repeat="chiffre in statistique.chiffres"> <span class="mdl-list__item-primary-content" ng-bind="chiffre._nom"></span> <span class="mdl-list__item-secondary-content" ng-bind="chiffre._valeur"></span> </li> </ul> <div class="groupbutton metier"> <span class="mdl-chip" ng-class="{\'mdl-chip--deletable\':statistique.filtres.secteur || statistique.filtres.metier || statistique.filtres.codeaprm}" data-toggle="modal" data-target="#metierModal"> <span class="mdl-chip__text">{{statistique.filtres.secteur?statistique.filtres.secteur:"Métier"}} <span ng-show="statistique.filtres.metier">,{{statistique.filtres.metier}}</span> <span ng-show="!statistique.filtres.metier && statistique.filtres.codeaprm">,{{statistique.filtres.codeaprm}}</span> </span> <button type="button" class="mdl-chip__action" ng-show="statistique.filtres.secteur || statistique.filtres.metier || statistique.filtres.codeaprm" ng-click="supp([\'secteur\',\'metier\',\'codeaprm\'],$event)"><i class="material-icons">cancel</i></button> </span> <span class="mdl-chip" ng-class="{\'mdl-chip--deletable\':statistique.filtres.statut}" data-toggle="modal" data-target="#statutModal"> <span class="mdl-chip__text">{{statistique.filtres.statut?statistique.filtres.statut:"Statut"}}</span> <button type="button" class="mdl-chip__action" ng-show="statistique.filtres.statut" ng-click="supp([\'statut\'],$event);"><i class="material-icons">cancel</i></button> </span> <span class="mdl-chip" ng-class="{\'mdl-chip--deletable\':statistique.filtres.qualif}" data-toggle="modal" data-target="#qualifModal"> <span class="mdl-chip__text">{{statistique.filtres.qualif?statistique.filtres.qualif:"Qualification"}}</span> <button type="button" class="mdl-chip__action" ng-show="statistique.filtres.qualif" ng-click="supp([\'qualif\'],$event);"><i class="material-icons">cancel</i></button> </span> <span class="mdl-chip" ng-class="{\'mdl-chip--deletable\':statistique.filtres.sexe}" data-toggle="modal" data-target="#sexeModal"> <span class="mdl-chip__text">{{statistique.filtres.sexe?statistique.filtres.sexe:"Sexe"}}</span> <button type="button" class="mdl-chip__action" ng-show="statistique.filtres.sexe" ng-click="supp([\'sexe\'],$event);"><i class="material-icons">cancel</i></button> </span> <span class="mdl-chip" ng-class="{\'mdl-chip--deletable\':statistique.filtres.debAge || statistiques.filtres.finAge}" data-toggle="modal" data-target="#ageModal"> <span class="mdl-chip__text">{{(statistique.filtres.debAge || statistiques.filtres.finAge)?statistique.filtres.debAge + " à " + statistique.filtres.finAge:"Age"}}</span> <button type="button" ng-show="statistique.filtres.debAge || statistiques.filtres.finAge" class="mdl-chip__action" ng-click="supp([\'debAge\',\'finAge\'],$event)"><i class="material-icons">cancel</i></button> </span> <span class="mdl-chip" ng-class="{\'mdl-chip--deletable\':statistique.filtres.debImmat || statistique.filtres.debRad}" data-toggle="modal" data-target="#evolModal"> <span class="mdl-chip__text"> {{!(statistique.filtres.debRad || statistique.filtres.debImmat)?"Création / Radiation":""}} {{statistique.filtres.debImmat?"Immatriculé depuis " + statistique.filtres.debImmat:""}} {{statistique.filtres.debRad?"Radié depuis " + statistique.filtres.debRad:""}} </span> <button type="button" ng-show="statistique.filtres.debRad || statistique.filtres.debImmat" ng-click="supp([\'debImmat\',\'debRad\'],$event)" class="mdl-chip__action"><i class="material-icons">cancel</i></button> </span> </div> </div>')}]);