//
//   LabelPlus_Ps_Script.jsx
//   This is a Input Text Tool for LabelPlus Text File.
// 
// Copyright 2015, Noodlefighter
// Released under GPL License.
//
// License: http://noodlefighter.com/label_plus/license
//
//@show include  
//@include "my_include.js" 
//@include "my_action.js"
//@include "labelplus_text_reader.js"
//@include "get_internal_font_name.js"
//

// ======================================== Gobal Const 
// Version
const _MY_VER = "1.1";
const _MY_FILE_VER = "1.0";

// String Const
//@include "global_const_en.js"
//-include "global_const_zh.js"


// Operating System related
var dirSeparator = $.os.search(/windows/i) === -1 ? '/': '\\';

scriptPath = function () {
  new String (fileName);

  fileName = $.fileName;
  return fileName;
}

//
// ��ʼ����
//
LabelPlusInputOptions = function(obj) {
  var self = this;  
 
  Stdlib.copyFromTo(obj, self);  
};
LabelPlusInputOptions.prototype.typename = "LabelPlusInputOptions";
LabelPlusInputOptions.LOG_FILE = Stdlib.PREFERENCES_FOLDER + "/LabelPlusInput.log";

//
// �û�UI
//
LabelPlusInput = function() {
  var self = this;

  self.saveIni = false;
  self.hasBorder = true;
  self.optionsClass = LabelPlusInputOptions;
  self.settingsPanel = false; //���Լ��������������
  
  self.winRect = {          // the size of our window
    x: 200,
    y: 200,
    w: 875,
    h: 650
  };  
  
  self.title = _MY_APPNAME + " " + _MY_VER + " For FileVer<=" + _MY_FILE_VER;	// our window title
  self.notesSize = 75;
  self.notesTxt = _MY_TIP_TITLE;
  self.documentation = _MY_TIP_TEXT;
  
  self.processTxt = _MY_STRING_BUTTON_RUN;
  self.cancelTxt = _MY_STRING_BUTTON_CANCEL;
  
};

LabelPlusInput.prototype = new GenericUI();
LabelPlusInput.prototype.typename = "LabelPlusInput";

//
// �û����湹��
//
LabelPlusInput.prototype.createPanel = function(pnl, ini) {
  var self = this;
  var opts = new LabelPlusInputOptions(ini);// default values

  // window's location
  self.moveWindow(100, 100);   
  
  var xOfs = 10;
  var yOfs = 10;
  var xx = xOfs;
  var yy = yOfs;  
  
  //------------------�Լ��������������------------------  
  
  pnl.settingsPnl = pnl.add('panel', 
    [xOfs,yy,pnl.size.width-xOfs,yy+60]);   
    
  LabelPlusInput.createSettingsPanel(pnl.settingsPnl, ini);     
  
  xx = xOfs;
  yy += 75;  
  yOfs = yy; 
  //------------------LabelPlus�ļ���------------------
  
  // LabelPlus�ı��ļ�����
  pnl.lpTextFileLabel = pnl.add('statictext', [xx,yy,xx+120,yy+20],
                            _MT_STRING_LABEL_TEXTFILE);
  xx += 120;
  pnl.lpTextFileTextBox = pnl.add('edittext', [xx,yy,xx+170,yy+20], '');
  pnl.lpTextFileTextBox.enabled = false;
  xx += 175;
  pnl.lpTextFileBrowseButton = pnl.add('button', [xx,yy,xx+30,yy+20], '...');
  
  pnl.lpTextFileBrowseButton.onClick = function() {
    try {
      var pnl = this.parent;
      var fmask =  "*.txt;*.json";
      var f = File.openDialog(_MT_STRING_LABEL_TEXTFILE, fmask);
       
      if (f && f.exists) {
        pnl.lpTextFileTextBox.text = f.toUIString();
        
		//ͼԴ������ļ��и���Ŀ¼
        var fl = new Folder(f.path);		
        pnl.sourceTextBox.text = fl.toUIString();
        pnl.targetTextBox.text = fl.toUIString() + dirSeparator + 'output';
        
      }
      else{        
        return;        //ȡ��
      }
      
      pnl.chooseImageListBox.removeAll();
      pnl.chooseGroupListBox.removeAll();
      
      // ��ȡLabelPlus�ļ�
      var labelFile;
      try{
        labelFile = new LabelPlusTextReader(pnl.lpTextFileTextBox.text);        
      }
      catch(err){        
        alert(err);
        return;
      } 
    
      // ���ͼƬѡ���б�
      var arr = labelFile.ImageList;
      if(arr){
        for(var i=0; i<arr.length ;i++){
          pnl.chooseImageListBox[i] = pnl.chooseImageListBox.add('item', arr[i], i);      
          pnl.chooseImageListBox[i].selected = true;
        }
      }
    
      // ������ѡ���б�    
      var arr = labelFile.GroupData;
      if(arr){
        for(var i=0; i<arr.length ;i++){
          if(arr[i] == "")
            continue;
          pnl.chooseGroupListBox[i] = pnl.chooseGroupListBox.add('item', arr[i], i);
          pnl.chooseGroupListBox[i].selected = true;

          // Ϳ�� ָ�������ı������� ���һ������
          if (pnl.overlayGroupTextBox.text == "") {
			pnl.overlayGroupTextBox.text = arr[i];
          }
        }            
      }      
      
      pnl.labelFile = labelFile;  //����LabelPlusTextReader����
      
    } catch (e) {
      alert(Stdlib.exceptionMessage(e));
    }
  };


  //------------------ͼƬѡ����------------------
  yy = yOfs +35;  
  xx = xOfs;  

  // ѡ����Ҫ�����ͼƬ
  pnl.chooseImageLabel =  pnl.add('statictext', [xx,yy,xx+150,yy+22],
                                           _MT_STRING_LABEL_SELECTIMAGE );
  yy += 20;
  pnl.chooseImageListBox = pnl.add('listbox', [xx,yy,xx+150,yy+285], [] ,{multiselect:true});

  //------------------����ѡ����------------------
  yy = yOfs +35;  
  xOfs += 170;  
  xx = xOfs;
  
  //ѡ����Ҫ����ķ���
  pnl.chooseGroupLabel =  pnl.add('statictext', [xx,yy,xx+150,yy+22],
                                           _MT_STRING_LABEL_SELECTGROUP );
  yy += 20;
  pnl.chooseGroupListBox =  pnl.add('listbox', [xx,yy,xx+150,yy+285], [] ,{multiselect:true});

  //------------------������------------------
  yy = yOfs;
  xOfs = 10 +  345;  
  xx = xOfs;
  
  // >>>>>�ļ� Ԥ����
  pnl.add('statictext', [xx,yy,xx+120,yy+20],
                            _MT_STRING_LABEL_TIP_FILE);
  yy += 20;  
  // ͼԴ�ļ��� 
  pnl.sourceLabel = pnl.add('statictext', [xx,yy,xx+120,yy+20],
                            _MT_STRING_LABEL_SOURCE);
  xx += 120;
  pnl.sourceTextBox = pnl.add('edittext', [xx,yy,xx+300,yy+20], '');
  xx += 305;
  pnl.sourceBrowse = pnl.add('button', [xx,yy,xx+30,yy+20], '...');

  pnl.sourceBrowse.onClick = function() {
    try {
      var pnl = this.parent;
      var def = (pnl.sourceTextBox.text ?
                 new Folder(pnl.sourceTextBox.text) : Folder.desktop);
      var f = Folder.selectDialog(_MT_STRING_LABEL_SOURCE , def);

      if (f) {
        pnl.sourceTextBox.text = f.toUIString();
        if (!pnl.targetTextBox.text) {
          pnl.targetTextBox.text = pnl.sourceTextBox.text;
        }
      }
    } catch (e) {
      alert(Stdlib.exceptionMessage(e));
    }
  };

  xx = xOfs;
  yy += 25;

  // ���Ŀ¼
  pnl.targetLabel = pnl.add('statictext', [xx,yy,xx+120,yy+20],
                            _MT_STRING_LABEL_TARGET );
  xx += 120;
  pnl.targetTextBox = pnl.add('edittext', [xx,yy,xx+300,yy+20], '');  
  xx += 305;
  pnl.targetBrowse = pnl.add('button', [xx,yy,xx+30,yy+20], '...');

  pnl.targetBrowse.onClick = function() {
    try {
      var pnl = this.parent;
      var f;
      var def = pnl.targetTextBox.text;
      if (!def) {
        if (pnl.sourceTextBox.text) {
          def = pnl.sourceTextBox.text;
        } else {
          def = Folder.desktop;
        }
      }
      var f = Stdlib.selectFolder(_MT_STRING_LABEL_TARGET , def);

      if (f) {
        pnl.targetTextBox.text = f.toUIString();
      }
    } catch (e) {
      alert(Stdlib.exceptionMessage(e));
    }
  };

  xx = xOfs;
  yy += 25;

  // ����LabelPlus�ı��е�ͼԴ�ļ���
  pnl.ignoreImgFileNameCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                          _MT_STRING_CHECKBOX_IGNOREIMGFILENAME);
  pnl.ignoreImgFileNameCheckBox.onClick = function () {
  	pnl.setSourceFileTypeCheckBox.value = false;	// ��ָ��ͼԴ����
  	pnl.ignoreImgFileNameTestButton.enabled = pnl.ignoreImgFileNameCheckBox.value;
  }
  xx += 260;
  pnl.ignoreImgFileNameTestButton = pnl.add('button',  [xx,yy,xx+80,yy+18], 'preview');
  pnl.ignoreImgFileNameTestButton.enabled = false;	
 
  // Ԥ�������ļ���Ч��
  pnl.ignoreImgFileNameTestButton.onClick = function() {
	var originFileNameList = LabelPlusInput.getFilesListOfPath(pnl.sourceTextBox.text); 
  	var selectedImgFileNameList = LabelPlusInput.getSelectedItemsText(pnl.chooseImageListBox);

  	var preview_list_string = '';
  	for (var i = 0; i < selectedImgFileNameList.length; i++) {
  		if (i >= 10) {
  			break;
  		}
  		if (!originFileNameList[i]) {
  			break;
  		}
  		preview_list_string = preview_list_string + selectedImgFileNameList[i].text + " -> " 
  		                    + originFileNameList[selectedImgFileNameList[i].index] + "\n";
  	}
  	alert(preview_list_string);
  }

  xx = xOfs;
  yy += 20;  

  // ʹ��ָ������ͼԴ
  pnl.setSourceFileTypeCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                          _MT_STRING_CHECKBOX_SETSOURCETYPE  );
  pnl.setSourceFileTypeCheckBox.onClick = function() {
  	pnl.ignoreImgFileNameCheckBox.value = false;	//������ͼԴ�ļ�������
    pnl.setSourceFileTypeList.enabled = pnl.setSourceFileTypeCheckBox.value;
  }  
  xx += 260;
  var setSourceFileTypeListItems = [".psd", ".png", ".jpg", "jpeg", ".tif", ".tiff"];
  pnl.setSourceFileTypeList = pnl.add('dropdownlist', [xx,yy,xx+70,yy+22],
                                   setSourceFileTypeListItems);  
  pnl.setSourceFileTypeList.selection = pnl.setSourceFileTypeList.find(".psd");
  pnl.setSourceFileTypeList.enabled = false;
  
  xx = xOfs;
  yy += 20;  

  // �����ޱ���ĵ�
  pnl.outputNoSignPsdCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                          _MT_STRING_CHECKBOX_OUTPUTNOSIGNPSD  );
  xx = xOfs;
  yy += 20;  

  // ����󲻹ر��ĵ�
  pnl.notCloseCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                           _MT_STRING_CHECKBOX_NOTCLOSE );
  xx = xOfs;
  yy += 20;  
  
  // �ı��滻(��:"A->B|C->D")
  pnl.textReplaceCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                          _MT_STRING_CHECKBOX_TEXTREPLACE);
  pnl.textReplaceCheckBox.onClick = function() {
    pnl.textReplaceTextBox.enabled = pnl.textReplaceCheckBox.value;
  };
  xx += 260;
  pnl.textReplaceTextBox = pnl.add('edittext', [xx,yy,xx+180,yy+20]);  
  pnl.textReplaceTextBox.text = "����->!?|...->��";
  pnl.textReplaceTextBox.enabled = false;
  xx = xOfs;
  yy += 20;  
  

  // >>>>>������Ŀ
  yy += 10;
  pnl.add('statictext', [xx,yy,xx+120,yy+20],
                            _MT_STRING_LABEL_TIP_INPUTITEM);
  yy += 20;  

  // �������ѡ��
  pnl.outputLabelNumberCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                           _MT_STRING_CHECKBOX_OUTPUTLABELNUMBER);
  xx = xOfs;
  yy += 20;  
    
  // ����ͼ����з���
  pnl.layerNotGroupCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                           _MT_STRING_CHECKBOX_LAYERNOTGROUP);
  yy += 20;  
  
  // >>>>>��ʽ / �Զ���
  yy += 10;
  pnl.add('statictext', [xx,yy,xx+120,yy+20],
                            _MT_STRING_LABEL_TIP_STYLE_AUTO);
  yy += 20;  
  
  // ʹ���Զ�����������
  pnl.setFontCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                           _MT_STRING_CHECKBOX_SETFONT);  
  pnl.setFontCheckBox.onClick = function() {
    var value = pnl.setFontCheckBox.value;
    pnl.font.family.enabled = value;
    pnl.font.style.enabled = value;
    pnl.font.fontSize.enabled = value;
  }    
  xx = xOfs;
  yy += 20;  
  // ����
  pnl.font = pnl.add('group', [xx,yy,xx+400,yy+40]);
  self.createFontPanel(pnl.font, ini);
  pnl.font.label.text = _MT_STRING_LABEL_FONT;  
  pnl.font.family.enabled = false;
  pnl.font.style.enabled = false;
  pnl.font.fontSize.enabled = false;
  pnl.font.family.selection = pnl.font.family.find("SimSun");
  
  xx = xOfs;
  yy += 20;  

  // �����������
  pnl.outputHorizontalCheckBox = pnl.add('checkbox', [xx,yy,xx+250,yy+22],
                                           _MT_STRING_CHECKBOX_OUTPUTHORIZONTALTEXT);
  xx = xOfs;
  yy += 20;  
      
  // ִ�ж���GroupN
  pnl.runActionGroupCheckBox = pnl.add('checkbox', [xx,yy,xx+500,yy+22],
                                           _MT_STRING_CHECKBOX_RUNACTION );
  pnl.runActionGroupCheckBox.onClick = function() {
    pnl.runActionGroupList.enabled = pnl.runActionGroupCheckBox.value;
  }                                             
  xx = xOfs + 30;
  yy += 20;  
  var ary = Stdlib.getActionSets();  
  pnl.runActionGroupList = pnl.add('dropdownlist', [xx,yy,xx+180,yy+22], ary);  
  pnl.runActionGroupList.selection = pnl.runActionGroupList.find("LabelPlusAction");
  if (pnl.runActionGroupList.selection == undefined)
  {
    pnl.runActionGroupList.selection = pnl.runActionGroupList[0];
  }
  pnl.runActionGroupList.enabled = false;
  
  xx = xOfs;
  yy += 20;  

  // Ϳ�׹���ѡ��
  pnl.overlayCheckBox = pnl.add('checkbox', [xx,yy,xx+300,yy+22],
                                           _MT_STRING_CHECKBOX_OVERLAY );
  pnl.overlayCheckBox.onClick = function() {
    pnl.overlayGroupTextBox.enabled = pnl.overlayCheckBox.value; 
  }
  xx += 300;

  pnl.overlayGroupTextBox = pnl.add('edittext', [xx,yy,xx+180,yy+20]);    
  pnl.overlayGroupTextBox.enabled = false;

  //------------------��ȡ������------------------
  if (ini) {   // if there was an ini object
    //�ı��滻
    if(ini.textReplace){
      pnl.textReplaceCheckBox.value = true;
      pnl.textReplaceTextBox.enabled = true;
      pnl.textReplaceTextBox.text = opts.textReplace;
    }  
    
    // ����  
    if (ini.setFont) {
      pnl.setFontCheckBox.value = true;
      pnl.font.family.enabled =  true;
      pnl.font.style.enabled =  true;
      pnl.font.fontSize.enabled =  true;      
      pnl.font.setFont(ini.font, ini.fontSize);
    }
    
    // �������ѡ��
    if(ini.outputLabelNumber){
      pnl.outputLabelNumberCheckBox.value = ini.outputLabelNumber;
    }
  
    // �����������
    if(ini.horizontalText){
      pnl.outputHorizontalCheckBox.value = ini.horizontalText;
    }
    // �����ޱ���ĵ�
    if(ini.outputNoSignPsd){
      pnl.outputNoSignPsdCheckBox.value = ini.outputNoSignPsd;
    }

    // ����LabelPlus�ı��е�ͼԴ�ļ���
    if (ini.ignoreImgFileName) {
    	pnl.ignoreImgFileNameCheckBox.value = true;
    }

    // ʹ��ָ������ͼԴ
    if (ini.sourceFileType){    
      pnl.setSourceFileTypeCheckBox.value = true;
      pnl.setSourceFileTypeList.enabled = true;
      pnl.setSourceFileTypeList.selection.text = ini.sourceFileType;
    }
  
    // ִ�ж���GroupN
    if (ini.runActionGroup){
      pnl.runActionGroupCheckBox.value = true;
      pnl.runActionGroupList.enabled = true;      
      pnl.runActionGroupList.selection.text = ini.runActionGroup;  
    }  
  
    // ����󲻹ر��ĵ�
    if(ini.notClose)
      pnl.notCloseCheckBox.value = true;
    
    // ����ͼ����з���
    if(ini.layerNotGroup)
      pnl.layerNotGroupCheckBox.value = true;

  	// Ϳ��
  	if (ini.overloayGroup) {
  		pnl.overlayCheckBox.value = true;
  		pnl.overlayGroupTextBox.enabled = true;
  		pnl.overlayGroupTextBox.text = ini.overloayGroup;
  	}

  } 

  return pnl; 
};

//
// �Զ����ȡ���
//
LabelPlusInput.createSettingsPanel = function(pnl, ini) {
  var win = GenericUI.getWindow(pnl.parent);

  pnl.text = _MT_STRING_LABEL_SETTING;
  pnl.win = win;

  pnl.fileMask = "INI Files: *.ini, All Files: *.*";
  pnl.loadPrompt = "Read Setting";
  pnl.savePrompt = "Save Setting";
  pnl.defaultFile = undefined;

  var w = pnl.bounds[2] - pnl.bounds[0];
  var offsets = [w*0.2, w*0.5, w*0.8];
  var y = 15;
  var bw = 90;

  var x = offsets[0]-(bw/2);
  pnl.load = pnl.add('button', [x,y,x+bw,y+20], _MY_STRING_BUTTON_LOAD);
  x = offsets[1]-(bw/2);
  pnl.save = pnl.add('button', [x,y,x+bw,y+20], _MY_STRING_BUTTON_SAVE);
  x = offsets[2]-(bw/2);
  pnl.reset = pnl.add('button', [x,y,x+bw,y+20], _MY_STRING_BUTTON_RESET);

  pnl.load.onClick = function() {
    var pnl = this.parent;
    var win = pnl.win;
    var mgr = win.mgr;
    var def = pnl.defaultFile;

    if (!def) {
      if (mgr.iniFile) {
        def = GenericUI.iniFileToFile(mgr.iniFile);
      } else {
        def = GenericUI.iniFileToFile("~/settings.ini");
      }
    }

    var f;
    var prmpt = pnl.loadPrompt;
    var sel = Stdlib.createFileSelect(pnl.fileMask);
    if (isMac()) {
      sel = undefined;
    }
    f = Stdlib.selectFileOpen(prmpt, sel, def);
    if (f) {
      win.ini =LabelPlusInput.readIni(f);
      win.close(4);

      if (pnl.onLoad) {
        pnl.onLoad(f);
      }
    }
  };

  pnl.save.onClick = function() {
    var pnl = this.parent;
    var win = pnl.win;
    var mgr = win.mgr;
    var def = pnl.defaultFile;

    if (!def) {
      if (mgr.iniFile) {
        def = GenericUI.iniFileToFile(mgr.iniFile);
      } else {
        def = GenericUI.iniFileToFile("~/settings.ini");
      }
    }

    var f;
    var prmpt = pnl.savePrompt;
    var sel = Stdlib.createFileSelect(pnl.fileMask);

    if (isMac()) {
      sel = undefined;
    }
    f = Stdlib.selectFileSave(prmpt, sel, def);

    if (f) {
      var mgr = win.mgr;
      var res = mgr.validatePanel(win.appPnl, win.ini, true);

      if (typeof(res) != 'boolean') {
        LabelPlusInput.writeIni(f, res);

        if (pnl.onSave) {
          pnl.onSave(f);
        }
      }
    }
  };

  pnl.reset.onClick = function() {
    var pnl = this.parent;
    var win = pnl.win;
    var mgr = win.mgr;

    if (mgr.defaultIniFile) {
      win.ini = mgr.readIniFile(mgr.defaultIniFile);

    } else if (mgr.ini) {
      win.ini = mgr.ini;
    }

    win.close(4);
    if (pnl.onReset) {
      pnl.onReset();
    }
  };
};

//
// �����û�UI����
//
LabelPlusInput.prototype.validatePanel = function(pnl, ini, tofile) {
  var self = this;
  var opts = new LabelPlusInputOptions(ini);

  // д������ʱ����洢��Щ
  if(!tofile || tofile == false){
    // ͼԴ�ļ���
    if (pnl.sourceTextBox.text) {    
      f = new Folder(pnl.sourceTextBox.text);
    }
    else{
      return self.errorPrompt(_MT_ERROR_NOTFOUNDSOURCE);  
    }

    if (!f || !f.exists) {
      return self.errorPrompt(_MT_ERROR_NOTFOUNDSOURCE);
    }
    opts.source = f.toUIString();
    
    // ���Ŀ¼
    if (pnl.targetTextBox.text) {
      f = new Folder(pnl.targetTextBox.text);
      if (!f.exists) {
        if (!f.create()) {
          return self.errorPrompt(_MT_ERROR_CANNOTBUILDNEWFOLDER);
        }
      }
    }
    else{
      return self.errorPrompt(_MT_ERROR_NOTFOUNDTARGET);
    }
    
    
    if (!f || !f.exists) {
      return self.errorPrompt(_MT_ERROR_NOTFOUNDTARGET);
    }
    opts.target = f.toUIString();

    // LabelPlus�ı�
    f = new File(pnl.lpTextFileTextBox.text);
    if(!f || !f.exists) {
      return self.errorPrompt(_MT_ERROR_NOTFOUNLABELTEXT);
    }
    opts.labelFilename = pnl.lpTextFileTextBox.text;

    var fl = new Folder(f.path);
    opts.labelFilePath = fl.toUIString();    
    
    // Imageѡ��  
    if(!pnl.chooseImageListBox.selection || pnl.chooseImageListBox.selection.length == 0)
      return self.errorPrompt(_MT_ERROR_NOTCHOOSEIMAGE);
    else
    {
      var sortedImgSelection = pnl.chooseImageListBox.selection.sort();
      opts.imageSelected = new Array(); 

      for(var i=0;i<sortedImgSelection.length;i++) {
        opts.imageSelected[i] = {text  : sortedImgSelection[i].text, 
        						 index : sortedImgSelection[i].index };        
      }
    }
    // ����ѡ��
    if(!pnl.chooseGroupListBox.selection || pnl.chooseGroupListBox.selection.length ==0)
      return self.errorPrompt(_MT_ERROR_NOTCHOOSEGROUP);  
    else
    {
      opts.groupSelected = new Array();
      for(var i=0;i<pnl.chooseGroupListBox.selection.length;i++)
        opts.groupSelected[i] = pnl.chooseGroupListBox.selection[i].text;      
    }
      
  }
  // �ı��滻  
  if(pnl.textReplaceCheckBox.value)
    opts.textReplace = pnl.textReplaceTextBox.text;  

  // ����  
  if(pnl.setFontCheckBox.value){
    opts.setFont = true;
    var font = pnl.font.getFont()
    opts.font = font.font;
    opts.fontSize = font.size;
  }

  // �������ѡ��
  if(pnl.outputLabelNumberCheckBox.value)
    opts.outputLabelNumber = true;
  
  // �����������
  if(pnl.outputHorizontalCheckBox.value)
    opts.horizontalText = true;
  
  // �����ޱ���ĵ�
  if(pnl.outputNoSignPsdCheckBox.value)
    opts.outputNoSignPsd = true;

  // ����LabelPlus�ı��е�ͼԴ�ļ���
  if (pnl.ignoreImgFileNameCheckBox.value) {
  	opts.ignoreImgFileName = true;
  }
  
  // ʹ��ָ������ͼԴ
  if (pnl.setSourceFileTypeCheckBox.value){    
    opts.sourceFileType = pnl.setSourceFileTypeList.selection.text;
  }
  else
    opts.sourceFileType = undefined;
  
  // ִ�ж���GroupN
  if (pnl.runActionGroupCheckBox.value)
    opts.runActionGroup = pnl.runActionGroupList.selection;
  else
    opts.runActionGroup = undefined;
  
  // ����󲻹ر��ĵ�
  if(pnl.notCloseCheckBox.value)
    opts.notClose = true;
    
  // ����ͼ����з���
  if(pnl.layerNotGroupCheckBox.value)
    opts.layerNotGroup = true;
  
  // Ϳ��
  if (pnl.overlayCheckBox.value) { 
  	opts.overloayGroup = pnl.overlayGroupTextBox.text;
  }

  return opts;
};

//
// ִ���û�UI����
//
LabelPlusInput.prototype.process = function(opts, doc) {
  var self = this;

  Stdlib.log.setFile(opts.labelFilePath + dirSeparator + "LabelPlusInputer.log");//LabelPlusInputOptions.LOG_FILE);
  Stdlib.log("Start");
  Stdlib.log("Properties:");
  Stdlib.log(listProps(opts)); 

  //��ȡͼԴ�ļ����ļ��б� 
  var originFileList = LabelPlusInput.getFilesListOfPath(opts.source);
    
  //����LabelPlus�ı�
  var lpFile = new LabelPlusTextReader(opts.labelFilename);
  
  //��ȡ�ı��滻����
  if(opts.textReplace)
    var textReplace = LabelPlusInput.textReplaceReader(opts.textReplace); 
  
  //������ѡͼƬ ��������= =
  for(var i=0; i<opts.imageSelected.length; i++){
    var originName = opts.imageSelected[i].text;
    var filename;
    var labelData = lpFile.LabelData[originName];
    var gourpData = lpFile.GroupData;    
    
    // ����sourceFileType�滻�ļ���׺��      
    if(opts.sourceFileType){
      filename = originName.substring(0,originName.lastIndexOf("."))  + opts.sourceFileType;
    }
    else
      filename = originName;

  	// ����ԭʼͼƬ��
  	if (opts.ignoreImgFileName) {
  		filename = originFileList[opts.imageSelected[i].index];  		
  	}

    // �������ޱ���ĵ�
    if(!opts.outputNoSignPsd && labelData.length == 0)
      continue;
      
    // ��ͼƬ�ļ�
    var bgFile = File(opts.source + dirSeparator + filename);
    if(!bgFile || !bgFile.exists){
      var msg = "Image " + filename + " Not Found.";
      Stdlib.log(msg);
      alert(msg);
      continue;
    } 
      
    // ��PS�д��ļ� 
    var bg = app.open(bgFile);
    
    // ���ĵ�����Ϊ����ɫģʽ ����ΪRGBģʽ
    if (bg.mode == DocumentMode.INDEXEDCOLOR){
        bg.changeMode(ChangeMode.RGB);
    }        
    
    var layerGroups = new Array();
    
    // �ļ���ʱִ��һ�ζ���"_start"
    if(opts.runActionGroup) {      
      try{
        bg.activeLayer = bg.layers[bg.layers.length-1];
        app.doAction("_start" , opts.runActionGroup);
      }
      catch(e){ }
    }  
        
    // Ϳ��
    if (opts.overloayGroup) {
	    var labelArr = new Array();
	    
	    // �ҳ���ҪͿ�׵ı�ǩ
	    for(var j=0; j<labelData.length; j++){
	        var labelX = labelData[j].LabelheadValue[0];
	        var labelY = labelData[j].LabelheadValue[1];
	        var labelXY = { x:labelX, y:labelY };        
	        var labelGroup = gourpData[labelData[j].LabelheadValue[2]];
	        
	        if(labelGroup == opts.overloayGroup){
	            labelArr.push(labelXY);
	        }            
	    }

	    //ִ��Ϳ��
	    MyAction.lp_dialogClear(labelArr, bg.width, bg.height, 16, 1);        
	}
    
    // ����LabelData
    for(var j=0; j<labelData.length; j++){
        var labelNum = j+1;
        var labelX = labelData[j].LabelheadValue[0];
        var labelY = labelData[j].LabelheadValue[1];
        var labelGroup = gourpData[labelData[j].LabelheadValue[2]];
        var labelString = labelData[j].LabelString;
        var artLayer;
        
        // ���ڷ����Ƿ���Ҫ����
        if(opts.groupSelected.indexOf(labelGroup) == -1)
          continue;
        
        // ��������
        if(!opts.layerNotGroup && !layerGroups[labelGroup]){
          layerGroups[labelGroup] = bg.layerSets.add();
          layerGroups[labelGroup].name = labelGroup;
        }       
        if(opts.outputLabelNumber && !layerGroups["_Label"]){
          layerGroups["_Label"] = bg.layerSets.add();
          layerGroups["_Label"].name = "Label";
        }        
        
        // �������
        if(opts.outputLabelNumber){
          LabelPlusInput.newTextLayer(bg,
            labelNum,
            labelX,
            labelY,
            "Arial",
            opts.setFont ? opts.fontSize : undefined,
            false,
            90,
            layerGroups["_Label"]
            );
        }
      
        // �滻�ı�
        if(textReplace){
          for(var k=0;k<textReplace.length;k++){
            while(labelString.indexOf(textReplace[k].From) != -1)
              labelString = labelString.replace (textReplace[k].From, textReplace[k].To);
          }
        }
      
        // �����ı�
        if(labelString && labelString != ""){
          artLayer = LabelPlusInput.newTextLayer(bg,
            labelString,
            labelX,
            labelY,
            opts.setFont ? opts.font : "SimSun",
            opts.setFont ? opts.fontSize : undefined,
            !opts.horizontalText,
            90,
            opts.layerNotGroup ?  undefined : layerGroups[labelGroup]);
        }
        
        // ִ�ж���,����Ϊ������
        if(opts.runActionGroup) {            
          try{
            bg.activeLayer = artLayer;
            app.doAction(labelGroup , opts.runActionGroup);
          }
          catch(e){
            Stdlib.log("DoAction " +labelGroup +
              " in " + opts.runActionGroup +
              " Error: \r\n" + e);
          }
        }        
    }
    
    // �ļ��ر�ʱִ��һ�ζ���"_end"
    if(opts.runActionGroup) {      
      try{
        bg.activeLayer = bg.layers[bg.layers.length-1];
        app.doAction("_end" , opts.runActionGroup);
      }
      catch(e){ }
    }        
    
    // �����ļ�
    var fileOut = new File(opts.target + "//" + filename);
    var options = PhotoshopSaveOptions;
    var asCopy = false;
    var extensionType = Extension.LOWERCASE;
    bg.saveAs(fileOut, options, asCopy, extensionType);
    
    // �ر��ļ�
    if(!opts.notClose)
      bg.close();    
  }
  alert(_MY_STRING_COMPLETE);
  Stdlib.log("Complete!");
};

//
// �����ı�ͼ��
//
LabelPlusInput.newTextLayer = function(doc,text,x,y,font,size,isVertical,opacity,group) {
  artLayerRef = doc.artLayers.add();
  artLayerRef.kind = LayerKind.TEXT;
  textItemRef = artLayerRef.textItem; 
  
  if(size)
    textItemRef.size = size;
  else
    textItemRef.size = doc.height / 90.0;
  
  textItemRef.font = font;
  if(isVertical)
    textItemRef.direction = Direction.VERTICAL;
    
  textItemRef.antiAliasMethod = AntiAlias.SMOOTH;
  textItemRef.position = Array(doc.width*x,doc.height*y);

  if(group)
    artLayerRef.move(group, ElementPlacement.PLACEATBEGINNING);  
    
  textItemRef.contents = text;
  
  return artLayerRef;
}

//
// �ı��滻�ַ�����������
//
LabelPlusInput.textReplaceReader = function(str){
  var arr = new Array();
  var strs = str.split('|');
  if(!strs)
    return; //����ʧ��
    
  for(var i=0; i<strs.length; i++){
    if(!strs[i] || strs[i]=="")
      continue;
      
    var strss = strs[i].split("->");
    if((strss.length != 2) || (strss[0]=="") )
      return; //����ʧ��
    
    arr.push({
      From : strss[0],
      To : strss[1],
    });
  }

  if(arr.length != 0)
    return arr;
  else 
    return;
}

//
// д������
//
LabelPlusInput.writeIni = function(iniFile, ini) {
  //$.level = 1; debugger;
  if (!ini || !iniFile) {
    return;
  }
  var file = GenericUI.iniFileToFile(iniFile);

  if (!file) {
    Error.runtimeError(9001, Error("Bad ini file specified: \"" + iniFile + "\"."));
  }

  if (file.open("w", "TEXT", "????")) {
    file.lineFeed = "unix";
    file.encoding = 'UTF-8';
    var str = GenericUI.iniToString(ini);
    file.write(str);
    file.close();
  }
  return ini;
};

//
// ��������
//
LabelPlusInput.readIni = function(iniFile, ini) {
  //$.level = 1; debugger;

  if (!ini) {
    ini = {};
  }
  if (!iniFile) {
    return ini;
  }
  var file = GenericUI.iniFileToFile(iniFile);

  if (!file) {
    Error.runtimeError(9001, Error("Bad ini file specified: \"" + iniFile + "\"."));
  }

  if (!file.exists) {
    //
    // XXX Check for an ini path .ini file in the script's folder.
    //
  }

  if (file.exists && file.open("r", "TEXT", "????")) {
    file.lineFeed = "unix";
    file.encoding = 'UTF-8';
    var str = file.read();
    ini = GenericUI.iniFromString(str, ini);
    file.close();
  }

  if (ini.noUI) {
    ini.noUI = toBoolean(ini.noUI);
  }

  return ini;
};

//
// ��ȡ�ļ������ļ����ļ����ַ����б�
//
LabelPlusInput.getFilesListOfPath = function(path) {
	var folder = new Folder(path); 
	  	if (!folder.exists) {
	  		return null;
	  	}

	  	var fileList = folder.getFiles();
	  	var fileNameList = new Array();

	  	for (var i = 0; i < fileList.length; i++) {
	  		var file = fileList[i]; 
	  		if (file instanceof File) {
	  			var short_name = file.toString().split("/");
	  			fileNameList.push(short_name[short_name.length - 1]);
	  		}
	  	}   

  		return fileNameList.sort();
}

//
// ��ȡListBoxѡ����Ŀtext��index
//
LabelPlusInput.getSelectedItemsText = function(listBox) {
	var selectedItems = new Array();

  	for (var i = 0; i < listBox.children.length; i++) {
  		if (listBox[i].selected) 
  			selectedItems.push({ text: listBox[i].text, index: listBox[i].index });
  	}  
  	return selectedItems;
}
// ������
LabelPlusInput.main = function() {
  var ui = new LabelPlusInput();
  ui.exec();  
};

LabelPlusInput.main();

"LabelPlus_Ps_Script.jsx";
// EOF
