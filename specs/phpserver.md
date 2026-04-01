<?php
namespace Api\Controller;

use Common\Controller\AppframeController;

class GuestbookController extends AppframeController{
	
	protected $guestbook_model;
	
	public function _initialize() {
		parent::_initialize();
		$this->guestbook_model=D("Common/Guestbook");
	}
	
	// 留言提交
	public function addmsg(){
		if(!sp_check_verify_code()){
			$this->error("验证码错误！");
		}

        // if ($_POST['note'] !== 'product/ai/presales_robot' && !sp_check_verify_code()) {
		// 	$this->error("验证码错误！");
		// }

        $utmJson = json_decode($_COOKIE['utmParameters'],TRUE);
        $referrer = $utmJson['referrer'];
        $device = $utmJson['device'];
        $browser = $utmJson['browser'];
        $utm_source = $utmJson['utm_source'];
        $utm_medium = $utmJson['utm_medium'];
        $utm_campaign = $utmJson['utm_campaign'];
        $utm_content = $utmJson['utm_content'];
        $utm_term = $utmJson['utm_term'];

		if (IS_POST) {
			if ($this->guestbook_model->create()!==false) {
				$result=$this->guestbook_model->add();
				if ($result!==false) {
                    $id = $result;
                    $config = json_decode(htmlspecialchars_decode(sp_get_cmf_settings('guestbook_views_config')),TRUE);
                    $type = $_POST['type'];
                    $fields = $config[$type]['fields'];
                    $email = $config[$type]['email'];
                    
                    $_POST['createtime'] = date('Y-m-d H:i:s',time());
                    if ($_SERVER['SERVER_NAME'] !== '0.com' && $_POST['phone'] !== '13000000000') {
                        if ($email){
                            $_POST['createtime'] = date('Y-m-d H:i:s',time());
                            $content = '';
                            foreach($fields as $k => $v){
                                $content .= $v.'：'.$_POST[$k].'<br>';
                            }
                            $content .= '<br><hr>此邮件由系统发出，请勿直接回复！';
                            em_send_email($email['title'],$content,$email['add'],$email['cc'],$email['bcc']);
                        }
                        if ($type=='try_kefu' && $_POST['note']=='product/cs/ticket'){
                            em_send_email('工单试用申请',$content,'try-ticket@easemob.com');
                        }
                        if ($type == 'try_kefu' && trim($_POST['phone'])) {
                            // 推送到 CRM 系统
                            $result = json_decode(file_get_contents('http://crm.easemob.com/distributor.action?serviceName=clogin&userName=api@easemob.com&password=eilaakdfo_9QQGGGG'), true);
                            if ($result['result']) {
                                $cplx = '';
                                $form = '试用申请';
                                switch ($_POST['note']) {
                                    case 'product/ai/presales_robot':
                                        $cplx = '公有云-AI';
                                        break;
                                    case 'product/ai/call':
                                        $cplx = '公有云-外呼机器人';
                                        break;
                                    case 'solution/cs/finance': case 'solution/cs/government':
                                        $cplx = '公有云-CEC';
                                        break;
                                    case 'product/cs/video': case 'product/vec':
                                        $cplx = '公有云-VEC';
                                        $form = '下载《视频客服行业发展报告》申请';
                                        break;
                                    case 'solution/social': case'solution/car': case 'solution/medical': case 'solution/education': case 'solution/ecommerce': case 'solution/hardware': case 'solution/insurance': case 'solution/hr': case 'solution/game':
                                        $cplx = '解决方案';
                                        break;
                                    case 'event/10th':
                                        $cplx = '10周年';
                                        $form = '下载白皮书合集';
                                        break;
                                }
                                $caseStr = '';
                                switch ($_POST['note']) {
                                    case 'solution/social':
                                        $caseStr = ' 泛娱乐社交解决方案';
                                        break;
                                    case 'solution/medical':
                                        $caseStr = ' 医疗行业解决方案';
                                        break;
                                    case 'solution/education':
                                        $caseStr = ' 教育行业解决方案';
                                        break;
                                    case 'solution/car':
                                        $caseStr = ' 汽车行业解决方案';
                                        break;
                                    case 'solution/ecommerce':
                                        $caseStr = ' 社交电商解决方案';
                                        break;
                                    case 'solution/hardware':
                                        $caseStr = ' 智能硬件解决方案';
                                        break;
                                    case 'solution/insurance':
                                        $caseStr = ' 保险行业解决方案';
                                        break;
                                    case 'solution/hr':
                                        $caseStr = ' 招聘行业解决方案';
                                        break;
                                    case 'solution/game':
                                        $caseStr = ' 游戏行业解决方案';
                                        break;
                                }
                                $formType = '官网表单';
                                if ($_POST['note'] == 'solution/doc') {
                                    $formType = '文档表单';
                                    $_POST['msg'] = '';
                                    $_POST['email'] = '';
                                    $_POST['industry'] = '';
                                }else if($_POST['note'] == 'form/pr') {
                                    $formType = 'PR表单';
                                }
                                $data = array(
                                    array(
                                        'fwly' => $referrer===null?'':$referrer,
                                        'yhsb' => $device===null?'':$device,
                                        'yhllq' => $browser===null?'':$browser,
                                        'ggly' => $utm_source===null?'':$utm_source,
                                        'ggmj' => $utm_medium===null?'':$utm_medium,
                                        'ggmc' => $utm_campaign===null?'':$utm_campaign,
                                        'ggnr' => $utm_content===null?'':$utm_content,
                                        'gggjc' => $utm_term===null?'':$utm_term,
                                        'email' => $_POST['email'],
                                        'hangye' => $_POST['industry'],
                                        'name' => $_POST['full_name'],
                                        'dianhua' => $_POST['phone'],
                                        'company' => $_POST['company'],
                                        'sjly' => $formType,
                                        'zcrq' => $_POST['createtime'],
                                        'beizhu' => '访问页面:' . (isset($_POST['note']) && $_POST['note'] ? 'http://www.easemob.com/' . $_POST['note'] . $caseStr  .'页面' : '首页') . ";" . "意向情况: " . $_POST['msg'],
                                        'cplx' => $cplx
                                    )
                                );
                                $result = json_decode(curl_request('http://crm.easemob.com/distributor.action?serviceName=insert&objectApiName=Lead&data='.urlencode(json_encode($data)).'&binding=' . $result['binding']), true);
                                if (isset($result['result']) && $result['result']) {
                                    $this->guestbook_model->where(array('id' => $id))->save(array('sync_new' => 1));
                                }
                            }
                        }
                        
                        // 上传百度 OCPC 转化数据
                        $this->uploadBaiduOcpc();
                    }
					// $this->success(base64UrlEncode(openssl_encrypt($id, 'AES-128-ECB', 'https://easemob.com/product/cs/video', OPENSSL_RAW_DATA)));
                    $this->success($id);
					return j(1, '留言成功！');
				} else {
					$this->error("留言失败！");
				}
			} else {
				$this->error($this->guestbook_model->getError());
			}
		}
		
	}

    /**
     * 上传百度 OCPC 转化数据
     * @return bool
     */
    private function uploadBaiduOcpc() {
        // 检查是否有 bd_vid
        $bd_vid = isset($_SESSION['bd_vid']) ? $_SESSION['bd_vid'] : '';
        if (empty($bd_vid)) {
            return false;
        }
        
        // 百度 OCPC API 配置
        $baidu_ocpc_token = '2h2AUnv0UczTzFs5dGHXXkSN3AYBRYkI@IAOB1RQ9P0cZkx1zfRrBi2ioQL5WGvuB';
        $baidu_ocpc_url = 'https://ocpc.baidu.com/ocpcapi/api/uploadConvertData';
        
        // 构建 logidUrl（包含 bd_vid 的落地页 URL）
        $logidUrl = 'https://www.easemob.com/' . (isset($_POST['note']) ? $_POST['note'] : '') . '?bd_vid=' . $bd_vid;
        
        // 构建请求数据
        $postData = array(
            'token' => $baidu_ocpc_token,
            'conversionTypes' => array(
                array(
                    'logidUrl' => $logidUrl,
                    'newType' => 27  // 转化类型：27 表示表单提交
                )
            )
        );
        
        // 发送请求到百度 OCPC
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baidu_ocpc_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json'
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        // 记录日志（可选）
        if ($httpCode == 200) {
            $result = json_decode($response, true);
            if (isset($result['status']) && $result['status'] == 0) {
                // 上传成功
                return true;
            }
        }
        
        // 上传失败，可以记录日志便于排查
        // error_log('Baidu OCPC upload failed: ' . $response);
        return false;
    }

    public function addmsgAsync(){
        header('Access-Control-Allow-Origin: https://www.absoloop.io');
        header('Access-Control-Allow-Credentials: true');

		if(!sp_check_verify_code()){
            return j(1, '验证码错误！');
		}

        // if ($_POST['note'] !== 'product/ai/presales_robot' && !sp_check_verify_code()) {
		// 	$this->error("验证码错误！");
		// }

		if (IS_POST) {
			if ($this->guestbook_model->create()!==false) {
				$result=$this->guestbook_model->add();
				if ($result!==false) {
                    $config = json_decode(htmlspecialchars_decode(sp_get_cmf_settings('guestbook_views_config')),TRUE);
                    $type = $_POST['type'];
                    $fields = $config[$type]['fields'];
                    $email = $config[$type]['email'];
                    if ($email){
                        $_POST['createtime'] = date('Y-m-d H:i:s',time());
                        $content = '';
                        foreach($fields as $k => $v){
                            $content .= $v.'：'.$_POST[$k].'<br>';
                        }
                        $content .= '<br><hr>此邮件由系统发出，请勿直接回复！';
                         em_send_email($email['title'],$content,$email['add'],$email['cc'],$email['bcc']);
                    }
                    if ($type=='try_kefu' && $_POST['note']=='product/cs/ticket'){
                        em_send_email('工单试用申请',$content,'try-ticket@easemob.com');
                    }
                    return j(0, '留言成功！');
				} else {
                    return j(1, '留言失败！');
				}
			} else {
                return j(1, $this->guestbook_model->getError());
			}
		}
		
	}
}
