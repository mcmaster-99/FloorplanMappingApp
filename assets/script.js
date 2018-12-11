var Inlo=window.Inlo||{},notifs=document.getElementById("notifs");function setAuth(n,o,t){var e=new Date;e.setTime(e.getTime()+24*t*60*60*1e3);var i="expires="+e.toUTCString();document.cookie=n+"="+o+";"+i+";path=/"}function getAuth(n){for(var o=n+"=",t=decodeURIComponent(document.cookie).split(";"),e=0;e<t.length;e++){for(var i=t[e];" "==i.charAt(0);)i=i.substring(1);if(0==i.indexOf(o))return i.substring(o.length,i.length)}return""}!function(g){function n(n){var o,t,e,i,r,s=g("#emailInputSignin").val(),a=g("#passwordInputSignin").val();n.preventDefault(),o=s,t=a,e=function(n){console.log("Successfully Logged In"),console.log("result",n),setAuth("Authorization",n.token,1),console.log(getAuth("Authorization")),window.location.href="dashboard.html"},i=function(n){notifs.innerHTML="Your email or password is incorrect. Try again."},r={url:String(_config.api.inloApiUrl)+"/v1/user/login",crossDomain:!0,method:"POST",headers:{Accept:"application/json"},contentType:"application/json",data:JSON.stringify({email:o,password:t}),success:e,error:i},g.ajax(r).done(function(n){console.log(n)})}function o(n){var o,t,e,i,r,s,a=g("#nameInputRegister").val(),l=g("#emailInputRegister").val(),c=g("#passwordInputRegister").val(),u=g("#password2InputRegister").val();n.preventDefault(),c===u?(o=a,t=l,e=c,i=function(n){console.log(n),console.log("user registered");window.location.href="verify.html"},r=function(n){console.log(n.status),409===n.status?notifs.innerHTML="Oops, that email is already registered.":500===n.status&&(notifs.innerHTML="Sorry, there was an internal error.")},s={url:String(_config.api.inloApiUrl)+"/user/add",crossDomain:!0,method:"POST",headers:{Accept:"application/json"},contentType:"application/json",data:JSON.stringify({name:o,email:t,password:e}),success:i,error:r},g.ajax(s).done(function(n){console.log(n),console.log(s)})):notifs.innerHTML="Passwords do not match."}g(function(){g("#signinForm").submit(n),g("#registrationForm").submit(o)})}(jQuery);
window._config={cognito:{userPoolId:"us-west-2_EmZYHJNib",userPoolClientId:"1de9dc1303n9pdm0h7ljlsadvu",identityPoolId:"us-west-2:426460a4-e0a6-488b-aaa0-3d7ccab6a91a",region:"us-west-2"},api:{coreFunctionsUrl:"https://3mrhnqd4c4.execute-api.us-west-2.amazonaws.com/prod",inloApiUrl:"https://api.theinlo.com"}};
SVG.on(document,"DOMContentLoaded",function(){var y=new SVG("floorPlan").size("100%","100%").panZoom({zoomMin:.5,zoomMax:500,zoomFactor:.2}),o=new SVG("edit-floorplan-btn-div").size("100%","100%").attr({x:100,y:100}),e=o.circle(50).attr({id:"edit-floorplan-btn",x:"75%",y:"75%",cx:"80%",cy:"80%",fill:"black"}),n=o.image("images/editPen.png").attr({id:"edit-floorplan-icon",x:"76.5%",y:"73%"}),t=o.group().attr({id:"edit-floorplan-btn-group"});t.add(e),t.add(n),$("#edit-floorplan-btn-group").click(function(){window.location.href="mapedit.html"});var r,i,w=[],x={},g={},u={},_=!1;list_loaded=!1,function(){for(var o=w.length;0!==o;)w.pop(),o--;!0===_?console.log("Your floorplan has already been loaded."):$.ajax({method:"GET",url:String(_config.api.inloApiUrl)+"/v1/floorplan",headers:{Authorization:"Bearer "+getAuth("Authorization")},success:function(o){if(console.log("Response received from API: ",o),JSON.stringify(o.Items),0===o.length)$("#map-view-text").append("Map view not yet available");else for(var e=0;e<o.length;e++)if(0<o[e].rooms.length)for(var n=0;n<o[e].rooms.length;n++){var t=y.rect(o[e].rooms[n].width,o[e].rooms[n].height).attr({x:o[e].rooms[n].x,y:o[e].rooms[n].y,fill:"white",stroke:"#E3E3E3","stroke-width":3});t.node.id=o[e].rooms[n].roomID;var r=o[e].rooms[n].roomID;if(w.push(t),x[r]=o[e].rooms[n],o[e].rooms[n].hasOwnProperty("nodes"))for(var i=0;i<o[e].rooms[n].nodes.length;i++){var d=o[e].rooms[n].nodes[i].nodeID,a=document.getElementById(y.node.id).getBoundingClientRect().x,s=document.getElementById(y.node.id).getBoundingClientRect().y,l=o[e].rooms[n].x-a,c=o[e].rooms[n].y-s,m=o[e].rooms[n].height,f=o[e].rooms[n].width,p=o[e].rooms[n].nodes[i].x,g=o[e].rooms[n].nodes[i].y,u=p*f+l,v=g*m+c;console.log(n),console.log(l,c);var h=y.image("images/inlo-device.png",15,10);h.attr({x:u,y:v,fill:"white",stroke:"#E3E3E3",id:d})}}_=!0},error:function(o,e,n){console.error("Error requesting devices: ",e,", Details: ",n),console.error("Response: ",o),window.location.href="signin.html"}})}(),r=function(){for(var o in u){for(var e,n,t=u[o].roomID,r=u[o].nearestNodeID,i=u[o].region,d=(u[o].roomName,document.getElementById(y.node.id).getBoundingClientRect().x),a=document.getElementById(y.node.id).getBoundingClientRect().y,s=x[t].x-d,l=x[t].y-a,c=x[t].height,m=x[t].width,f={},p=0;p<x[t].nodes.length;p++)x[t].nodes[p].nodeID===r&&(f=x[t].nodes[p],console.log(f));switch(node_x_frac=f.x,node_y_frac=f.y,node_x=node_x_frac*m+s,node_y=node_y_frac*c+l,i){case"N":e=node_x_frac<.5?s+.25*m:s+.75*m,n=node_y_frac<.5?l+.25*c:l+.75*c;break;case"F":e=node_x_frac<.5?s+.75*m:s+.25*m,n=node_y_frac<.5?l+.75*c:l+.25*c}g[o]={},g[o].Icon=y.image("images/inlo.png",10,10),g[o].Icon.attr({x:e,y:n,fill:"white",stroke:"#E3E3E3"})}},i=function(){for(var o in u){var e=u[o].roomName,n=u[o].macAddress;$("#items-listed").append("<div class='item-rows'><p class='item-names'>"+n+"</p><p class='item-rooms'>"+e+"</p></div>")}list_loaded=!0},$.ajax({method:"GET",url:String(_config.api.inloApiUrl)+"/v1/nodes",headers:{Authorization:"Bearer "+getAuth("Authorization")},contentType:"application/json",success:function(o){console.log("Response received from API: ",o);for(var e=0;e<o.length;e++)"device"===o[e].type&&(u[o[e].nodeID]=o[e]);r(),i()},error:function(o,e,n){console.error("Error requesting devices: ",e,", Details: ",n),console.error("Response: ",o.responseText),alert("An error occured when requesting devices:\n"+o.responseText)}})}),$(document).ready(function(){$("#map-view-div").hide(),$("#list-view-btn").click(function(){$("#prompt").fadeOut(),$("#floorPlan").fadeOut(),$("#map-view-text").fadeOut(),$("#items-listed-div").delay(500).fadeIn("slow"),$("#dropdown-sort-div").delay(500).fadeIn("slow")}),$("#map-view-btn").click(function(){$("#dropdown-sort-div").fadeOut(),$("#prompt").fadeOut(),$("#items-listed-div").fadeOut(),$("#floorPlan").delay(500).fadeIn("slow"),$("#map-view-text").delay(500).fadeIn("slow"),$("#map-view-div").delay(500).fadeIn("slow")}),$("#dropdown-btn").click(function(){$("#dropdown-menu").toggle(500)})});
var WildRydes=window.WildRydes||{};WildRydes.map=WildRydes.map||{},function(d){require(["esri/Map","esri/views/MapView","esri/Graphic","esri/geometry/Point","esri/symbols/TextSymbol","esri/symbols/PictureMarkerSymbol","esri/geometry/support/webMercatorUtils","dojo/domReady!"],function(e,t,l,u,i,n,a){var o,g,r=WildRydes.map,y=new t({center:[-122.31,47.6],container:"map",map:new e({basemap:"gray-vector"}),zoom:12}),m=new i({color:"#f50856",text:"",font:{size:20,family:"CalciteWebCoreIcons"}}),p=new n({url:"/images/unicorn-icon.png",width:"25px",height:"25px"});function c(e){r.center={latitude:e.latitude,longitude:e.longitude}}function s(e){var t=a.xyToLngLat(e.xmin,e.ymin),i=a.xyToLngLat(e.xmax,e.ymax);r.extent={minLng:t[0],minLat:t[1],maxLng:i[0],maxLat:i[1]}}y.watch("extent",s),y.watch("center",c),y.then(function(){s(y.extent),c(y.center)}),y.on("click",function(e){r.selectedPoint=e.mapPoint,y.graphics.remove(o),o=new l({symbol:m,geometry:r.selectedPoint}),y.graphics.add(o),d(r).trigger("pickupChange")}),r.animate=function(r,m,c){var s,d=function(e){var t,i,n,a,o;s||(s=e),t=e-s,i=Math.min(t/2e3,1),a=(m.latitude-r.latitude)*i,o=(m.longitude-r.longitude)*i,n=new u({longitude:r.longitude+o,latitude:r.latitude+a}),y.graphics.remove(g),g=new l({geometry:n,symbol:p}),y.graphics.add(g),i<1?requestAnimationFrame(d):c()};requestAnimationFrame(d)},r.unsetLocation=function(){y.graphics.remove(o)}})}(jQuery);
$(window).bind("beforeunload",function(){return"Are you sure you want to leave?"}),SVG.on(document,"DOMContentLoaded",function(){$("#draw").append('<svg id="svgGrid" xmlns="http://www.w3.org/2000/svg">\x3c!-- Grid --\x3e<defs><pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" stroke-width="0.5"/></pattern><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#smallGrid)"/><path d="M 100 0 L 0 0 0 100" fill="none" stroke="gray" stroke-width="1"/></pattern></defs>\x3c!-- Grid [End] --\x3e<rect width="1000vw" height="1000vh" fill="url(#grid)" /></svg'),function(){m=[],!0===v&&(p.clear(),u=[]);$.ajax({method:"GET",url:String(_config.api.inloApiUrl)+"/v1/floorplan",headers:{Authorization:"Bearer "+getAuth("Authorization")},success:function(e){if(console.log("Response received from API: ",e),0===e.length)console.log("here"),$("#map-view-text").append("Map view not yet available");else{y=e,m=JSON.stringify(e);for(var o=0;o<e.length;o++)if(0<e[o].rooms.length)for(var t=0;t<e[o].rooms.length;t++){var n=p.rect(e[o].rooms[t].width,e[o].rooms[t].height).attr({x:e[o].rooms[t].x,y:e[o].rooms[t].y,fill:"white",stroke:"#E3E3E3","stroke-width":3});n.node.id=e[o].rooms[t].roomID;var r=n.node.id;u.push(n);var i=r+"group",d=p.group().addClass(i);if(d.add(n.addClass(i)),e[o].rooms[t].hasOwnProperty("nodes"))for(var s=0;s<e[o].rooms[t].nodes.length;s++){var l=e[o].rooms[t].nodes[s].nodeID,a=w(r,l),c=a[0],g=a[1];f[l]={},f[l].Icon=p.image("images/inlo-device.png",15,10),f[l].Icon.attr({x:c,y:g,fill:"white",stroke:"#E3E3E3",id:l}),d.add(f[l].Icon.addClass(i))}h[r]=d}}v=!0},error:function(e,o,t){console.error("Error requesting devices: ",o,", Details: ",t),console.error("Response: ",e.responseText),window.location.href="signin.html"}})}();var p=new SVG("svgGrid").size("100%","100%").attr({x:500,y:500}).panZoom({zoomMin:.5,zoomMax:20,zoomFactor:.2}),u=[],m=[],f={},y=[],h={},v=!1,e=new SVG("front-door-symbol-div").size("100%","100%").attr({x:100,y:100});e.image("/images/frontDoorText.png").attr({x:"15%",y:"25%"}),e.image("/images/frontDoorSymbol.png").attr({x:"30%",y:"50%"});p.on("panEnd",function(e){p.viewbox().x,p.viewbox().y;console.log(p.viewbox())});var o=new SVG("cancel-save-return-buttons-div").size("100%","100%").attr({x:250,y:250}),t=(o.text("Cancel").attr({id:"cancel-changes-btn",x:0,y:100}),o.text("Return to dashboard").attr({id:"return-dashboard-btn",x:0,y:50}),o.circle(50).attr({id:"save-changes-btn",cx:110,cy:110,fill:"#363636",stroke:"#E3E3E3","stroke-width":3})),n=o.group().addClass("saveGroup").add(t),r=o.text("Save").attr({x:Number(t.node.attributes[2].value)-17,y:Number(t.node.attributes[3].value)-15,fill:"white"});function w(e,o){var t,n;console.log(e,o);for(var r=document.getElementById(p.node.id).getBoundingClientRect().x,i=document.getElementById(p.node.id).getBoundingClientRect().y,d=document.getElementById(e).getBoundingClientRect().x-r,s=document.getElementById(e).getBoundingClientRect().y-i,l=document.getElementById(e).getBoundingClientRect().height,a=document.getElementById(e).getBoundingClientRect().width,c=0;c<y.length;c++)for(var g=0;g<y[c].rooms.length;g++)if(y[c].rooms[g].hasOwnProperty("nodes"))for(var u=0;u<y[c].rooms[g].nodes.length;u++)o===y[c].rooms[g].nodes[u].nodeID&&(t=y[c].rooms[g].nodes[u].x,n=y[c].rooms[g].nodes[u].y);return[t*a+d,n*l+s]}n.add(r),$("#return-dashboard-btn").click(function(){window.location.href="dashboard.html"}),$("#cancel-changes-btn").click(function(){!function(){if(1==confirm("Are you sure you want to cancel changes?")){y=JSON.parse(m);for(var e=0;e<u.length;e++){var o=u[e].node.parentElement.id;$("#"+String(o)).remove()}for(u=[],e=0;e<y.length;e++)if(0<y[e].rooms.length)for(var t=0;t<y[e].rooms.length;t++){var n=p.rect(y[e].rooms[t].width,y[e].rooms[t].height).attr({x:y[e].rooms[t].x,y:y[e].rooms[t].y,fill:"white",stroke:"#E3E3E3","stroke-width":3});n.node.id=y[e].rooms[t].roomID;var r=n.node.id;u.push(n);var i=r+"group",d=p.group().addClass(i);if(d.add(n.addClass(i)),y[e].rooms[t].hasOwnProperty("nodes"))for(var s=0;s<y[e].rooms[t].nodes.length;s++){var l=y[e].rooms[t].nodes[s].nodeID,a=w(r,l),c=a[0],g=a[1];f[l]={},f[l].Icon=p.image("images/inlo-device.png",15,10),f[l].Icon.attr({x:c,y:g,fill:"white",stroke:"#E3E3E3",id:l}),d.add(f[l].Icon.addClass(i))}h[r]=d}}}()}),$(".saveGroup").click(function(){!function(e){for(var o=0;o<y.length;o++){console.log(y[o].floorID);var t=y[o].floorID,n={rooms:y[o].rooms};console.log(n),$.ajax({method:"PATCH",url:String(_config.api.inloApiUrl)+"/v1/floorplan/"+t,headers:{Authorization:"Bearer "+getAuth("Authorization")},data:n,success:r,error:function(e,o,t){console.error("Error requesting devices: ",o,", Details: ",t),console.error("Response: ",e.responseText),alert("An error occured when requesting devices:\n"+e.responseText)}})}function r(e){console.log("save complete"),console.log("result is:",e)}m=JSON.stringify(y)}()}),$("#print-data").on("click",function(){console.log("currentFloorPlan",y),console.log("initialFloorPlanData",m),console.log("floorPlanSvg",u),console.log("floorPlanGroups",h)}),$("#create-floorplan").on("click",function(){$.ajax({method:"POST",url:String(_config.api.inloApiUrl)+"/v1/floorplan",headers:{Authorization:"Bearer "+getAuth("Authorization")},success:function(e){console.log("save complete"),console.log("result is:",e)},error:function(e,o,t){console.error("Error requesting devices: ",o,", Details: ",t),console.error("Response: ",e.responseText),alert("An error occured when requesting devices:\n"+e.responseText)}}),m=JSON.stringify(y)}),$("#delete-floorplan").on("click",function(){var e;e=y[0],$.ajax({method:"DELETE",url:String(_config.api.inloApiUrl)+"/v1/floorplan/0",headers:{Authorization:"Bearer "+getAuth("Authorization")},data:e,success:function(e){console.log("save complete"),console.log("result is:",e)},error:function(e,o,t){console.error("Error requesting devices: ",o,", Details: ",t),console.error("Response: ",e.responseText),alert("An error occured when requesting devices:\n"+e.responseText)}}),m=JSON.stringify(y)}),$("#delete-rooms").on("click",function(){for(var e in h)h[e].node.children[0].instance.selectize(!1).resize("stop");for(var o=0;o<u.length;o++){var n=u[o].node.id;$("#"+n).on("click",function(e){n=e.target.id,this.instance.remove();for(var o=0;o<y.length;o++)for(var t=0;t<y[o].rooms.length;t++)y[o].rooms[t].roomID===n&&(y[o].rooms[t].hasOwnProperty("nodes")?alert("Cannot delete room. Node attached."):(console.log(y[o].rooms),y[o].rooms.splice(t,1),console.log(y)));u.splice(u.indexOf(o),1),delete h[n];for(o=0;o<u.length;o++)$("#"+u[o].node.id).off("click")})}}),$("#drag").on("click",function(e){for(var o in h)h[o].node.children[0].instance.selectize(!1).resize("stop"),console.log(h[o]),h[o].draggable({snapToGrid:8}),h[o].off("dragend"),h[o].on("dragend",function(e){e.preventDefault();var o=e.target.children[0].id,t=e.target.children[1].id;if(document.getElementById("svgGrid").hasAttribute("viewBox")){console.log("here");var n=p.viewbox().x,r=p.viewbox().y;console.log(p.viewbox());var i=document.getElementById(p.node.id).getBoundingClientRect().x-n,d=document.getElementById(p.node.id).getBoundingClientRect().y-r;console.log(i,d);var s=e.target.getBoundingClientRect().x-i,l=e.target.getBoundingClientRect().y-d;console.log(s,l),$("#"+e.target.id).removeAttr("transform"),$("#"+e.target.children[0].id).attr("x",String(s)),$("#"+e.target.children[0].id).attr("y",String(l));var a=w(o,t);console.log(a[0],a[1]),$("#"+e.target.childNodes[1].id).removeAttr("transform"),$("#"+e.target.children[1].id).attr("x",String(a[0])+n),$("#"+e.target.children[1].id).attr("y",String(a[1])+r)}else{i=document.getElementById(p.node.id).getBoundingClientRect().x,d=document.getElementById(p.node.id).getBoundingClientRect().y;var c=w(o,t);c[0],c[1],s=e.target.getBoundingClientRect().x-i,l=e.target.getBoundingClientRect().y-d;$("#"+e.target.id).removeAttr("transform"),$("#"+e.target.children[0].id).attr("x",String(s)),$("#"+e.target.children[0].id).attr("y",String(l)),$("#"+e.target.childNodes[1].id).removeAttr("transform"),a=w(o,t),$("#"+e.target.childNodes[1].id).attr("x",String(a[0])),$("#"+e.target.childNodes[1].id).attr("y",String(a[1]))}for(var g=0;g<y.length;g++)for(var u=0;u<y[g].rooms.length;u++)console.log("here"),y[g].rooms[u].roomID===o&&(y[g].rooms[u].x=s,y[g].rooms[u].y=l);console.log(y)})}),$("#drag-node").on("click",function(e){for(var o in h){h[o].node.children[0].instance.selectize(!1).resize("stop"),console.log(h[o]);for(var t=1;t<h[o].node.children.length;t++)console.log(h[o].node.childNodes[t].instance),h[o].node.childNodes[t].instance.draggable({snapToGrid:10}),h[o].node.childNodes[t].instance.off("dragend"),h[o].node.childNodes[t].instance.on("dragend",function(e){var o,t,n,r,i=e.target.instance.node.parentNode.firstChild.id,d=document.getElementById(p.node.id).getBoundingClientRect().x,s=document.getElementById(p.node.id).getBoundingClientRect().y,l=e.target.instance.node.id;console.log(i,l),console.log(e.target);for(var a=0;a<y.length;a++)for(var c=0;c<y[a].rooms.length;c++)console.log("here"),y[a].rooms[c].roomID===i&&(o=y[a].rooms[c].x,t=y[a].rooms[c].y,n=y[a].rooms[c].width,r=y[a].rooms[c].height);console.log(o,t);var g=document.getElementById(l).getBoundingClientRect().x-d-o,u=document.getElementById(l).getBoundingClientRect().y-s-t;console.log(g,u);var m=g/n,h=u/r;console.log(m,h);var f=w(i,l);f[0],f[1];console.log(f);for(e.target.getBoundingClientRect().x,e.target.getBoundingClientRect().y,a=0;a<y.length;a++)for(c=0;c<y[a].rooms.length;c++)for(var v=0;v<y[a].rooms[c].nodes.length;v++)y[a].rooms[c].nodes[v].nodeID===l&&(console.log("here"),y[a].rooms[c].nodes[v].x=m,y[a].rooms[c].nodes[v].y=h);console.log(y)})}}),$("#resize").on("click",function(){for(var e in h)h[e].draggable(!1);$("#svgGrid g rect").each(function(){this.instance.selectize().resize(),$("#"+this.instance.node.id).off("resizedone"),$("#"+this.instance.node.id).on("resizedone",function(e){for(var o=e.target.id,t=document.getElementById(p.node.id).getBoundingClientRect().x,n=document.getElementById(p.node.id).getBoundingClientRect().y,r=document.getElementById(o).getBoundingClientRect().x-t,i=document.getElementById(o).getBoundingClientRect().y-n,d=document.getElementById(o).getBoundingClientRect().width,s=document.getElementById(o).getBoundingClientRect().height,l=0;l<y.length;l++)for(var a=0;a<y[l].rooms.length;a++)if(y[l].rooms[a].roomID===o){if(console.log(y[l].rooms[a].hasOwnProperty("nodes")),y[l].rooms[a].hasOwnProperty("nodes"))for(var c=0;c<y[l].rooms[a].nodes.length;c++){var g=y[l].rooms[a].nodes[c].nodeID,u=w(o,g),m=u[0],h=u[1];f[g].Icon.animate().move(m,h)}y[l].rooms[a].x=r,y[l].rooms[a].y=i,y[l].rooms[a].width=d,y[l].rooms[a].height=s}})})}),$("#draw-rect").on("click",function(){for(var e in p.panZoom(!1),h)h[e].node.children[0].instance.selectize(!1).resize("stop");var s;p.on("mousedown",function(e){(s=p.rect()).draw(e).attr({fill:"white",stroke:"#E3E3E3","stroke-width":3})}),p.on("mouseup",function(e){var r;s.draw("stop"),p.off();var i=s.node.attributes[3].nodeValue,d=s.node.attributes[4].nodeValue;width=s.node.attributes[1].nodeValue,height=s.node.attributes[2].nodeValue,$.ajax({method:"POST",url:String(_config.api.inloApiUrl)+"/v1/room",headers:{Authorization:"Bearer "+getAuth("Authorization")},success:function(e){console.log(e),r=e.roomID,timestamp=e.timestamp;var o={rooms:[{roomID:r,roomName:"Kitchen",floor:1,x:i,y:d,width:width,height:height}]};console.log("0"),y[0].rooms.push(o.rooms[0]),u.push(s),console.log(y);var t=r+"group",n=p.group().addClass(t);n.add(u[u.length-1].addClass(t)),h[r]=n},error:function(e,o,t){console.error("Error requesting devices: ",o,", Details: ",t),console.error("Response: ",e.responseText),window.location.href="signin.html"}})})}),$("#draw-door").on("click",function(){for(var e=0;e<u.length;e++)u[e].selectize(!1).resize("stop").draggable(!1);for(e=0;e<h.length;e++)h[e].ungroup(p),console.log("floorPlan[i] ungrouped",h[e]);console.log("floorPlan after",u);var a=document.getElementById(p.node.id).getBoundingClientRect().x,c=document.getElementById(p.node.id).getBoundingClientRect().y;document.addEventListener("click",function(e){for(var o=e.clientX-a,t=e.clientY-c,n=0;n<u.length;n++){var r=Number(u[n].node.attributes[3].nodeValue),i=Number(u[n].node.attributes[4].nodeValue),d=Number(u[n].node.attributes[1].nodeValue),s=Number(u[n].node.attributes[2].nodeValue);if(o<r+10&&i+10<t&&r-10<o&&t<i+s-10)(l=p.line(o,t-10,o,t+10).stroke({color:"#888888",width:3})).node.attributes[3].nodeValue=Number(u[n].node.attributes[3].nodeValue),l.node.attributes[1].nodeValue=Number(u[n].node.attributes[3].nodeValue);else if(t<i+10&&r+10<o&&i-10<t&&o<r+d-10)(l=p.line(o-10,t,o+10,t).stroke({color:"#888888",width:3})).node.attributes[2].nodeValue=Number(u[n].node.attributes[4].nodeValue),l.node.attributes[4].nodeValue=Number(u[n].node.attributes[4].nodeValue);else if(o<r+d+10&&i+10<t&&r+d-10<o&&t<i+s-10)(l=p.line(o,t-10,o,t+10).stroke({color:"#888888",width:3})).node.attributes[3].nodeValue=Number(u[n].node.attributes[3].nodeValue)+d,l.node.attributes[1].nodeValue=Number(u[n].node.attributes[3].nodeValue)+d;else{if(!(t<i+s+10&&r+10<o&&i+s-10<t&&o<r+d-10))continue;var l;(l=p.line(o-10,t,o+10,t).stroke({color:"#888888",width:3})).node.attributes[2].nodeValue=Number(u[n].node.attributes[4].nodeValue)+s,l.node.attributes[4].nodeValue=Number(u[n].node.attributes[4].nodeValue)+s}}})})}),$(document).ready(function(){$("#items-listed-div").hide(),$("#dropdown-sort-div").hide(),$("#list-view-btn").click(function(){$("#prompt").fadeOut(),$("#tools").fadeOut(),$("#svgGrid").fadeOut(),$("#map-view-text").fadeOut(),$("#items-listed-div").delay(500).fadeIn("slow"),$("#dropdown-sort-div").delay(500).fadeIn("slow")}),$("#map-view-btn").click(function(){$("#dropdown-sort-div").fadeOut(),$("#prompt").fadeOut(),$("#items-listed-div").fadeOut(),$("#map-view-text").delay(500).fadeIn("slow"),$("#svgGrid").delay(500).fadeIn("slow")})});
function connectSocket(){window.WebSocket=window.WebSocket||window.MozWebSocket;var o=new WebSocket("ws://api.theinlo.com/api/events",{headers:{Authorization:"Bearer "+getAuth("Authorization")}});console.log(getAuth("Authorization")),o.onopen=function(){o.send(getAuth("Authorization")),console.log("open"),o.on("message",function(o){console.log("received "+o)})},o.onerror=function(o){console.log(o)},o.onmessage=function(e){try{JSON.parse(e.data)}catch(o){return void console.log("This doesn't look like a valid JSON: ",e.data)}},o.onclose=function(o){console.log("closed"),setTimeout(connectSocket,5e3)}}console.log(getAuth("Authorization")),connectSocket();