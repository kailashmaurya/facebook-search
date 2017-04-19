// JavaScript Controller

var myApp = angular.module('myApp',["ngAnimate"]);

myApp.controller('GreetingController', ['$scope', function($scope) {
	$scope.query = '';
	$scope.users = null;
	$scope.pages = null;
	$scope.events = null;
	$scope.places = null;
	$scope.groups = null;
	$scope.favorites = null;
	$scope.progress = false;
    $scope.latlong = ""; 
    $scope.favIdList = [];
    $scope.favObjList = [];
	$scope.table_content_visible = true;
	$scope.detail_content_visible = false;
	$scope.detail_obj = null;
	$scope.details = null;
	$scope.FACEBOOK_ACCESS = "FACEBOOK_ACCESS_TOKEN";
	$scope.no_album_data = false;
	$scope.no_post_data = false;
	$scope.progress_detail = false;
	$scope.detail_type = null;
	$scope.no_group_data = false;
	$scope.no_user_data = false;
	$scope.no_page_data = false;
	$scope.no_place_data = false;
	$scope.no_event_data = false;
	$scope.detail_slide = true;
	$scope.result_slide = false;
	
    function getLocation(position) {
        $scope.latlong = position.coords.latitude + "," + position.coords.longitude;
		console.log("Location : " + $scope.latlong);
    }
	
	function save_to_storage(obj, key){
		var strjson = angular.toJson(obj);
		localStorage.setItem(key, strjson);
	}
	
	function get_from_storage(key){
		var elemStr = localStorage.getItem(key);
		if(elemStr!= null){
			return JSON.parse(elemStr);
		}
		return null;
	}
	
	$scope.add_rem_from_fav = function(element, elemtype){
		var index = $scope.favIdList.indexOf(element.id);
		if (index > -1) {
			$scope.favIdList.splice(index, 1);
			$scope.favObjList.splice(index, 1);
		}else{
			$scope.favIdList.push(element.id);
			element.type = elemtype;
			$scope.favObjList.push(element);
		}
		save_to_storage($scope.favIdList, "favIdList");
		save_to_storage($scope.favObjList, "favObjList");
	};
    
	var idList = get_from_storage("favIdList");
	var objList = get_from_storage("favObjList");
	if(idList!=null){
	    $scope.favIdList = idList;
	}
	if(objList!=null){
	    $scope.favObjList = objList;
	}
	
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getLocation);
    }

	$scope.get_search_result = function(query){
		if(query!=''){
			$scope.no_group_data = false;
			$scope.no_user_data = false;
			$scope.no_page_data = false;
			$scope.no_place_data = false;
			$scope.no_event_data = false;
			if($scope.detail!==null){
				$scope.back_to_table();
			}
			$('#search_input').tooltip('hide');
			$scope.clear(false);
			$scope.progress = true;
			$.ajax({
				url: "http://path_to_your.elasticbeanstalk.com/?operation=search&query=" + query + "&location="+$scope.latlong, 
				success: function(result){
					var response = JSON.parse(result);
					$scope.progress = false;
					if(response.success){
						if(response.data.user.data.length!=0)
							$scope.users = response.data.user;
						else
							$scope.no_user_data = true;
						if(response.data.page.data.length!=0)
							$scope.pages = response.data.page;
						else
							$scope.no_page_data = true;
						if(response.data.event.data.length!=0)
							$scope.events = response.data.event;
						else
							$scope.no_event_data = true;
						if(response.data.place.data.length!=0)
							$scope.places = response.data.place;
						else
							$scope.no_place_data = true;
						if(response.data.group.data.length!=0)
							$scope.groups = response.data.group;
						else
							$scope.no_group_data = true;
					}
					else{
						console.log(response.message);
					}
					$scope.$apply();
				}
			});
		}
		else{
			$('#search_input').tooltip('show');
		}
	};
	
	$scope.clear = function(clear_query_flag){
		$scope.users = null;
		$scope.pages = null;
		$scope.events = null;
		$scope.places = null;
		$scope.groups = null;
		$scope.progress = false;
		$scope.favorites = null;
		$scope.no_group_data = false;
		$scope.no_user_data = false;
		$scope.no_page_data = false;
		$scope.no_place_data = false;
		$scope.no_event_data = false;
		if(clear_query_flag){
			$scope.query = '';
			$("#user_tab").addClass('active');
			$("#place_tab").removeClass('active');
			$("#event_tab").removeClass('active');
			$("#group_tab").removeClass('active');
			$("#page_tab").removeClass('active');
			$("#fav_tab").removeClass('active');
			$("#user").addClass('active');
			$("#place").removeClass('active');
			$("#event").removeClass('active');
			$("#group").removeClass('active');
			$("#page").removeClass('active');
			$("#fav").removeClass('active');
		}
	};
	
	$scope.get_page = function(page_url,tab){
		$.ajax({
		url: page_url, 
		success: function(result){
			if(tab=='users'){
				$scope.users = result;
			}else if(tab=='pages'){
				$scope.pages = result;
			}else if(tab=='events'){
				$scope.events = result;
			}else if(tab=='groups'){
				$scope.groups = result;
			}else if(tab='places'){
				$scope.places = result;
			}
			$scope.$apply();
		}});
	};
	
	$scope.get_details = function(object,type){
		$scope.table_content_visible = false;
		$scope.detail_slide = false;
		$("#table_content_div").addClass('displaynone');
		$("#detail_content").removeClass('displaynone');
		$scope.result_slide = true;
		$scope.progress_detail = true;
		$scope.detail_type = type;
		$scope.detail_obj = object;
		$scope.detail_content_visible = true;
		$scope.no_album_data = false;
		$scope.no_post_data = false;
		$.ajax({
		url: "http://path_to_your.elasticbeanstalk.com/?operation=detail&id=" + object.id, 
		success: function(result){
			var response = JSON.parse(result);
			if(response.success){
				if(!response.data.hasOwnProperty("albums"))
					$scope.no_album_data = true;
				if(!response.data.hasOwnProperty("posts"))
					$scope.no_post_data = true;
				$scope.details = response.data;
			}
			else{
				console.log(response.message);
				$scope.no_album_data = true;
				$scope.no_post_data = true;
			}
			$scope.progress_detail = false;
			$scope.$apply();
		}});
	};
	
	$scope.back_to_table = function(){
		$scope.detail_content_visible = false;
		$scope.result_slide = false;
		$("#detail_content").addClass('displaynone');
		$("#table_content_div").removeClass('displaynone');
		$scope.detail_slide = true;
		$scope.table_content_visible = true;
		$scope.details = null;
	};
	
	$("#search_input").keyup(function(event){
		if(event.keyCode == 13){
			$("#search_butt").click();
		}
	});
	
	$("#search_input").focus(function(e) {
        $('#search_input').tooltip('hide');
    });
	
	$scope.share_to_facebook = function(detail_obj){
		FB.ui({
			method: 'feed',
			link: window.location.href,
			picture: detail_obj.picture.data.url,
			name: detail_obj.name,
			caption: 'FB SEARCH FROM USC CSCI571',
			}, function(response){
				if (response && !response.error_message)
					alert("Posted Successfully");
				else
					alert("Not Posted");
		});
	};
}]);