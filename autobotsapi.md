@Test
public void testSse() throws Exception {
	HttpRequestBase httpReq = new HttpPost("http://autobots-bk.jd.local/autobots/api/v1/searchAiSse");
	RequestConfig requestConfig = RequestConfig.custom().setConnectTimeout(60000).setConnectionRequestTimeout(60000).setSocketTimeout(60000).build();
	httpReq.setConfig(requestConfig);
	//传入header信息
	httpReq.setHeader("autobots-agent-id", "xxxx");
	httpReq.setHeader("autobots-token", "xxxxxx");
	//传入body信息
	JSONObject body = new JSONObject();
	body.put("traceId", UUID.randomUUID().toString());
	body.put("reqId", String.valueOf(System.currentTimeMillis()));
	body.put("erp", "bjwangjuntao");
	body.put("keyword", "怎么申请vpn权限");
	((HttpEntityEnclosingRequestBase) httpReq).setEntity(new StringEntity(body.toJSONString(), ContentType.create("application/json", "utf-8")));
	CloseableHttpResponse response = HttpClient.INS.getHttpClient().execute(httpReq);
	log.info("sse形式接口返回......statusCode：" + response.getStatusLine().getStatusCode());
	BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
	String line;
	while ((line = reader.readLine()) != null) {
		if (StringUtils.isNotEmpty(line)) {
			log.info(line);
		}
	}
}

智能体会话推荐：/autobots/api/v1/suggestionQuery
执行工作流：/autobots/api/v1/runWorkflow
@Test
public void testRunWorkflowHttp() {
    Long FLOW_TIME_OUT = 5 * 60 * 1000L;
    Map<String, String> header = new HashMap<>();
    header.put("autobots-agent-id", "");
    header.put("autobots-token", "");
    JSONObject body = new JSONObject();
    body.put("traceId", UUID.randomUUID().toString());
    body.put("erp", "bjwangjuntao");
    body.put("workflowId", "203");
    //工作流入参，具体入参看在平台中配置的工作流
    Map<String, Object> workflowParams = new HashMap<>();
    workflowParams.put("interview", "京东");
    workflowParams.put("method", "");
    body.put("extParams", workflowParams);
    String bodyStr = body.toJSONString();
    String responseStr = HttpUtils.postReq("http://autobots-bk.jd.local/autobots/api/v1/runWorkflow", header, bodyStr);
    BotsResponse<AutoBotsResult> response = JSONObject.parseObject(responseStr, new TypeReference<BotsResponse<AutoBotsResult>>() {
    });
    if (response.getCode() == 200) {
        long startTime = System.currentTimeMillis();
        responseStr = HttpUtils.postReq("http://autobots-bk.jd.local/autobots/api/v1/getWorkflowResult", header, bodyStr);
        response = JSONObject.parseObject(responseStr, new TypeReference<BotsResponse<AutoBotsResult>>() {
        });
        // 判断没有结束，及超时（最好设置个超时，防止异常情况）
        while (response.getCode() == 200 && !response.getData().isFinished() && System.currentTimeMillis() - startTime < FLOW_TIME_OUT) {
            // 休眠一段时间，否则调用量太多会触发限流
            ThreadUtil.sleep(200);
            responseStr = HttpUtils.postReq("http://autobots-bk.jd.local/autobots/api/v1/getWorkflowResult", header, bodyStr);
            response = JSONObject.parseObject(responseStr, new TypeReference<BotsResponse<AutoBotsResult>>() {
            });
        }
        log.info("工作流结果：" + JSONObject.toJSONString(response.getData().getResultMap()));
    }
}

工作流获取结果(异步执行)：/autobots/api/v1/getWorkflowResult
    入参traceId、erp、workflowId为必填，并且必须跟runWorkflow一致
智能体问答结果反馈：/autobots/api/v1/feedback
入参：
{
  "traceId": "xxxxxxx",  // 会话ID，需要跟请求保持一致
  "reqId": "xxxxxx",  // 请求ID，需要跟请求保持一致
  "up": 1,  //是否点赞，1是，0否
  "down": 1, //是否点踩，1是，0否
  "downReason": "不好用"  //点踩原因
}