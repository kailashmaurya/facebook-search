<?php 
require_once __DIR__ . '/php-graph-sdk-5.0.0/src/Facebook/autoload.php';
define("FACEBOOK_ACCESS_TOKEN", "YOUR_EXTENDED_FACEBOOK_ACCESS_TOKEN");
header("Access-Control-Allow-Origin: *");
$urls = array("user"=>"", "page"=>"", "event"=>"", "group"=>"", "place"=>"");
$query = '';
$latlong = '';
if(isset($_GET['operation'])){
	$json_response = array("success"=>true);
	if($_GET['operation'] == 'search'){
		//operation=search&query=usc&location=lat,long
		if(isset($_GET["query"]) && isset($_GET["location"])){
			$query = $_GET['query'];
			$latlong = $_GET['location'];
			$urls["user"] = '/search?q='.urlencode($query).'&type=user&fields=id,name,picture.width(700).height(700)';
			$urls["page"] = '/search?q='.urlencode($query).'&type=page&fields=id,name,picture.width(700).height(700)';
			$urls["event"] = '/search?q='.urlencode($query).'&type=event&fields=id,name,picture.width(700).height(700),place';
			$urls["group"] = '/search?q='.urlencode($query).'&type=group&fields=id,name,picture.width(700).height(700)';
			$urls["place"] = '/search?q='.urlencode($query).'&type=place&center='.$latlong.'&fields=id,name,picture.width(700).height(700)';
			try {
				$fb = new Facebook\Facebook(['app_id' => 'facebook_app_id','app_secret' => 'facebook_app_secret','default_graph_version' => 'v2.8']);
				// Sets the default fallback access token so we don't have to pass it to each request
				$fb->setDefaultAccessToken(FACEBOOK_ACCESS_TOKEN);
				$query_response = array("user"=>"", "page"=>"", "event"=>"", "group"=>"", "place"=>"");
				//Get all data
				foreach($urls as $key=>$url){
					$response = $fb->get($url);
					$data = $response->getDecodedBody();
					$query_response[$key] = $data;
				}
				//var_dump($data["data"]);
				$json_response["data"] = $query_response;
				echo json_encode($json_response);
			} catch(Facebook\Exceptions\FacebookResponseException $e) {
				// When Graph returns an error
				$json_response["success"] = false;
				$json_response["message"] = "error with facebook sdk: ".$e->getMessage();
				echo json_encode($json_response);
				exit;
			} catch(Facebook\Exceptions\FacebookSDKException $e) {
				// When validation fails or other local issues
				$json_response["success"] = false;
				$json_response["message"] = "error with facebook sdk: ".$e->getMessage();
				echo json_encode($json_response);
				exit;
			}
		}
		else{
			$json_response["success"] = false;
			$json_response["message"] = 'missing parameter: query or location or both';
			echo json_encode($json_response);
		}
	}
	else if($_GET['operation'] == 'detail'){
		//opearation=detail&id=54785785987
			if(isset($_GET["id"])){
				try{
					$fb = new Facebook\Facebook(['app_id' => 'facebook_app_id','app_secret' => 'facebook_app_secret','default_graph_version' => 'v2.8']);
					$fb->setDefaultAccessToken(FACEBOOK_ACCESS_TOKEN);
					$url = "/".$_GET["id"]."?fields=id,name,picture.width(700).height(700),albums.limit(5){name,photos.limit(2){name, picture}},posts.limit(5){created_time,message,story}";
					$response = $fb->get($url);
					$data = $response->getDecodedBody();
					$json_response = array("success"=>true);
					$json_response["data"] = $data;
					echo json_encode($json_response);
				} catch(Facebook\Exceptions\FacebookResponseException $e) {
					// When Graph returns an error
					$json_response["success"] = false;
					$json_response["message"] = "error with facebook sdk: ".$e->getMessage();
					echo json_encode($json_response);
					exit;
				} catch(Facebook\Exceptions\FacebookSDKException $e) {
					// When validation fails or other local issues
					$json_response["success"] = false;
					$json_response["message"] = "error with facebook sdk: ".$e->getMessage();
					echo json_encode($json_response);
					exit;
				}
			}
			else{
				$json_response["success"] = false;
				$json_response["message"] = 'missing parameter: id';
				echo json_encode($json_response);
			}
	}
	else{
		//invalid value passed to operation parameter
		$json_response["success"] = false;
		$json_response["message"] = 'unsupported operation type';
		echo json_encode($json_response);
	}
}
else{
	$json_response["success"] = false;
	$json_response["message"] = 'missing parameter: operation';
	echo json_encode($json_response);
}
?>