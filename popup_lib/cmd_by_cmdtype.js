var cmd = [
  {
    "command_type": "aws.s3",
    "command": []
  },
  {
    "command_type": "aws.ses",
    "command": []
  },
  {
    "command_type": "aws.sqs",
    "command": []
  },
  {
    "command_type": "base",
    "command": [
      "appendText(var,appendWith)",
      "assertArrayContain(array,expected)",
      "assertArrayEqual(array1,array2,exactOrder)",
      "assertArrayNotContain(array,unexpected)",
      "assertContains(text,substring)",
      "assertCount(text,regex,expects)",
      "assertEmpty(text)",
      "assertEndsWith(text,suffix)",
      "assertEqual(expected,actual)",
      "assertMatch(text,regex)",
      "assertNotContain(text,substring)",
      "assertNotEmpty(text)",
      "assertNotEqual(value1,value2)",
      "assertStartsWith(text,prefix)",
      "assertTextOrder(var,descending)",
      "assertVarNotPresent(var)",
      "assertVarPresent(var)",
      "clear(vars)",
      "clearClipboard()",
      "copyFromClipboard(var)",
      "copyIntoClipboard(text)",
      "failImmediate(text)",
      "incrementChar(var,amount,config)",
      "macro(file,sheet,name)",
      "macroFlex(macro,input,output)",
      "outputToCloud(resource)",
      "prependText(var,prependWith)",
      "repeatUntil(steps,maxWaitMs)",
      "save(var,value)",
      "saveCount(text,regex,saveVar)",
      "saveMatches(text,regex,saveVar)",
      "saveReplace(text,regex,replace,resultVar)",
      "saveVariablesByPrefix(var,prefix)",
      "saveVariablesByRegex(var,regex)",
      "split(text,delim,saveVar)",
      "startRecording()",
      "stopRecording()",
      "substringAfter(text,delim,saveVar)",
      "substringBefore(text,delim,saveVar)",
      "substringBetween(text,start,end,saveVar)",
      "verbose(text)",
      "waitFor(waitMs)",
      "waitForCondition(conditions,maxWaitMs)"
    ]
  },
  {
    "command_type": "csv",
    "command": []
  },
  {
    "command_type": "desktop",
    "command": []
  },
  {
    "command_type": "excel",
    "command": []
  },
  {
    "command_type": "external",
    "command": []
  },
  {
    "command_type": "image",
    "command": []
  },
  {
    "command_type": "io",
    "command": []
  },
  {
    "command_type": "jms",
    "command": []
  },
  {
    "command_type": "json",
    "command": []
  },
  {
    "command_type": "localdb",
    "command": []
  },
  {
    "command_type": "macro",
    "command": []
  },
  {
    "command_type": "mail",
    "command": []
  },
  {
    "command_type": "number",
    "command": []
  },
  {
    "command_type": "pdf",
    "command": []
  },
  {
    "command_type": "rdbms",
    "command": []
  },
  {
    "command_type": "redis",
    "command": []
  },
  {
    "command_type": "sms",
    "command": []
  },
  {
    "command_type": "sound",
    "command": []
  },
  {
    "command_type": "ssh",
    "command": []
  },
  {
    "command_type": "step",
    "command": []
  },
  {
    "command_type": "step.inTime",
    "command": []
  },
  {
    "command_type": "web",
    "command": [
      "assertAndClick(locator,label)",
      "assertAttribute(locator,attrName,value)",
      "assertAttributeContain(locator,attrName,contains)",
      "assertAttributeNotContain(locator,attrName,contains)",
      "assertAttributeNotPresent(locator,attrName)",
      "assertAttributePresent(locator,attrName)",
      "assertChecked(locator)",
      "assertContainCount(locator,text,count)",
      "assertCssNotPresent(locator,property)",
      "assertCssPresent(locator,property,value)",
      "assertElementByAttributes(nameValues)",
      "assertElementByText(locator,text)",
      "assertElementCount(locator,count)",
      "assertElementDisabled(locator)",
      "assertElementEnabled(locator)",
      "assertElementNotPresent(locator)",
      "assertElementPresent(locator)",
      "assertElementsPresent(prefix)",
      "assertFocus(locator)",
      "assertFrameCount(count)",
      "assertFramePresent(frameName)",
      "assertIECompatMode()",
      "assertIENavtiveMode()",
      "assertLinkByLabel(label)",
      "assertMultiSelect(locator)",
      "assertNotChecked(locator)",
      "assertNotFocus(locator)",
      "assertNotText(locator,text)",
      "assertNotVisible(locator)",
      "assertOneMatch(locator)",
      "assertScrollbarHNotPresent(locator)",
      "assertScrollbarHPresent(locator)",
      "assertScrollbarVNotPresent(locator)",
      "assertScrollbarVPresent(locator)",
      "assertSingleSelect(locator)",
      "assertTable(locator,row,column,text)",
      "assertText(locator,text)",
      "assertTextContains(locator,text)",
      "assertTextCount(locator,text,count)",
      "assertTextList(locator,list,ignoreOrder)",
      "assertTextMatches(text,minMatch,scrollTo)",
      "assertTextNotPresent(text)",
      "assertTextOrder(locator,descending)",
      "assertTextPresent(text)",
      "assertTitle(text)",
      "assertValue(locator,value)",
      "assertValueOrder(locator,descending)",
      "assertVisible(locator)",
      "checkAll(locator, (removed)",
      "checkAll(locator,waitMs)",
      "clearLocalStorage()",
      "click(locator)",
      "clickAll(locator)",
      "clickAndWait(locator,waitMs)",
      "clickByLabel(label)",
      "clickByLabelAndWait(label,waitMs)",
      "clickOffset(locator,x,y)",
      "clickWithKeys(locator,keys)",
      "close()",
      "closeAll()",
      "deselectMulti(locator,array)",
      "dismissInvalidCert()",
      "dismissInvalidCertPopup()",
      "doubleClick(locator)",
      "doubleClickAndWait(locator,waitMs)",
      "doubleClickByLabel(label)",
      "doubleClickByLabelAndWait(label,waitMs)",
      "dragAndDrop(fromLocator,toLocator)",
      "dragTo(fromLocator,xOffset,yOffset)",
      "editLocalStorage(key,value)",
      "executeScript(var,script)",
      "focus(locator)",
      "goBack()",
      "goBackAndWait()",
      "maximizeWindow()",
      "mouseOver(locator)",
      "moveTo(x,y)",
      "open(url)",
      "openAndWait(url,waitMs)",
      "openHttpBasic(url,username,password)",
      "openIgnoreTimeout(url)",
      "refresh()",
      "refreshAndWait()",
      "resizeWindow(width,height)",
      "rightClick(locator)",
      "saveAllWindowIds(var)",
      "saveAllWindowNames(var)",
      "saveAttribute(var,locator,attrName)",
      "saveAttributeList(var,locator,attrName)",
      "saveBrowserVersion(var)",
      "saveCount(var,locator)",
      "saveDivsAsCsv(headers,rows,cells,nextPage,file)",
      "saveElement(var,locator)",
      "saveElements(var,locator)",
      "saveInfiniteDivsAsCsv(config,file)",
      "saveInfiniteTableAsCsv(config,file)",
      "saveLocalStorage(var,key)",
      "saveLocation(var)",
      "savePageAs(var,sessionIdName,url)",
      "savePageAsFile(sessionIdName,url,file)",
      "saveSelectedText(var,locator)",
      "saveSelectedValue(var,locator)",
      "saveTableAsCsv(locator,nextPageLocator,file)",
      "saveText(var,locator)",
      "saveTextArray(var,locator)",
      "saveTextSubstringAfter(var,locator,delim)",
      "saveTextSubstringBefore(var,locator,delim)",
      "saveTextSubstringBetween(var,locator,start,end)",
      "saveValue(var,locator)",
      "saveValues(var,locator)",
      "screenshot(file,locator,removeFixed)",
      "screenshotInFull(file,timeout,removeFixed)",
      "scrollElement(locator,xOffset,yOffset)",
      "scrollLeft(locator,pixel)",
      "scrollPage(xOffset,yOffset)",
      "scrollRight(locator,pixel)",
      "scrollTo(locator)",
      "select(locator,text)",
      "selectAllOptions(locator)",
      "selectFrame(locator)",
      "selectMulti(locator,array)",
      "selectMultiByValue(locator,array)",
      "selectMultiOptions(locator, removed)",
      "selectText(locator)",
      "selectWindow(winId)",
      "selectWindowAndWait(winId,waitMs)",
      "selectWindowByIndex(index)",
      "selectWindowByIndexAndWait(index,waitMs)",
      "switchBrowser(profile,config)",
      "toggleSelections(locator)",
      "type(locator,value)",
      "typeKeys(locator,value)",
      "uncheckAll(locator, removed)",
      "uncheckAll(locator,waitMs)",
      "unselectAllText()",
      "updateAttribute(locator,attrName,value)",
      "upload(fieldLocator,file)",
      "verifyContainText(locator,text)",
      "verifyText(locator,text)",
      "wait(waitMs)",
      "waitForElementPresent(locator, removed)",
      "waitForElementPresent(locator,waitMs)",
      "waitForElementsPresent(locators)",
      "waitForPopUp(winId,waitMs)",
      "waitForTextPresent(text)",
      "waitForTitle(text)",
      "waitUntilDisabled(locator,waitMs)",
      "waitUntilEnabled(locator,waitMs)",
      "waitUntilHidden(locator,waitMs)",
      "waitUntilVisible(locator,waitMs)"
    ]
  },
  {
    "command_type": "webalert",
    "command": []
  },
  {
    "command_type": "webcookie",
    "command": []
  },
  {
    "command_type": "word",
    "command": []
  },
  {
    "command_type": "ws",
    "command": []
  },
  {
    "command_type": "ws.async",
    "command": []
  },
  {
    "command_type": "xml"
  }
]