"use strict";
const bizSdk = require("facebook-nodejs-business-sdk");
const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const Content = bizSdk.Content;

module.exports = async function updateFacebookAdd(bodyData) {
  const access_token = process.env.FACEBOOK_ACCESS_TOKEN;
  const pixel_id = process.env.FACEBOOK_PIXELID;
  const api = bizSdk.FacebookAdsApi.init(access_token);
  const data = bodyData.data[0];
  console.log(bodyData);
  const userData_0 = new UserData()
    .setEmails(data.em)
    .setPhones([])
    .setClientIpAddress(request.connection.remoteAddress)
    .setClientUserAgent(request.headers["user-agent"])
    .setDatesOfBirth([])
    .setCities([])
    .setStates([])
    .setCountries([])
    .setExternalIds(data.external_id);
  const customData_0 = new CustomData().setValue(1).setCurrency("USD");
  const serverEvent_0 = new ServerEvent()
    .setEventName(data.event_name)
    .setEventTime(data.event_time)
    .setUserData(userData_0)
    .setCustomData(customData_0)
    .setActionSource(data.action_source);

  const eventsData = [serverEvent_0];
  const eventRequest = new EventRequest(access_token, pixel_id).setEvents(
    eventsData
  );
  eventRequest.execute();
  return null;
};
