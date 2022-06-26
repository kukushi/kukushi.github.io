---
layout: page
title: Feedback
categories: []
tags: []
status: publish
type: page
published: true
meta: {}
---

<h1 style="text-align: center; margin-bottom: 40px; margin-top: -50px">Feedback</h1>

<div id="rightCol">
</div>

<div style="width: 100%; float: left; margin-top: 20px">
  <hr />

  <form id="contactform" method="POST" action="https://formspree.io/os@sent.as">
    <p><b>Email Address</b></p>
    <input type="email" name="_replyto" placeholder="Your email address">

    <p><b>Message</b></p>
    <textarea placeholder="Your message" name="message"></textarea>
    <input type="hidden" name="_subject" value="New message from kushi.me" />
    <br />
    <input type="submit" value="Submit">
  </form>
</div>

<style type="text/css">
  #contactform {
    padding-top: 30px;
  }

  #contactform input[type="email"] {
    width: calc(100% - 20px);
    height: 30px;
    font-size: 16px;
    padding: 10px;
    margin-bottom: 10px;
  }
  #contactform textarea {
    width: calc(100% - 30px);
    height: 100px;
    font-size: 16px;
    border: 1px solid #ccc;
    background-color: #fafafa;
    padding: 15px;
    resize: vertical;
  }
  #contactform input[type="submit"] {
    display: inline-block;
    width: 127px;
    height: 42px;
    background-color: #272727;
    color: white;
    font-weight: 600;
    font-style: normal;
    font-size: 14px;
    border: none;
    margin-top: 10px;
    cursor: pointer;
  }
  #leftCol {
    margin-bottom: 40px;
    margin-right: 30px;
    width: 100%;
    text-align: center;
    height: 700px;
  }
  @media screen and (min-width: 800px) {
    #leftCol {
        width: 40%;
        float: left;
      }
    }
  }
  @media screen and (min-width: 800px) {
    #rightCol {
      width: 55%;
      float: right;
    }
  }
  }
</style>
