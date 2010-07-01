module JsHelper
  
  def flash_helper(flash)
    if(flash.length)
      
      
      case flash.keys[0]
        when :notice
        return("<span style=\"color: green\"> #{flash[:notice]} </span>")
        when :warning
        return("<span style=\"color: red\"> #{flash[:warning]} </span>")
        when :message
        return("<span style=\"color: blue\"> #{flash[:message]} </span>")
        
      end
    end
    return("") 
  end
  
  def cdate_field_tag(name, value = nil, options = {})
    #tag :input, { "type" => "text", "name" => name, "id" => name, "value" => value }.update(options.stringify_keys)
    "<div id='#{name}' value='#{value}' dojoType='dijit.form.DateTextBox' ></div>";
  end
  
  
  def close_button
    "<input type='button' value='Cancel' onclick='"+dojo_dialog_close+"' >"
  end
  
  def dojo_announce(area)
    "dojo.publish('#{area}',[]);"
  end
  
  # produce the js to hide a dialog 
  def dojo_dialog_close
    "zstaff.helpers.dialog.close();"
  end
  
  def escape_quotes( str )
    escape_javascript(str)
  end
  
  def dojo_flash( message )
'zstaff.helpers.toast.toast("'+message.gsub(/\"/,'\\\"')+'");';
  end
  
  
  def ajax_flash
  end
  
  def ajax_error_space( object, action )
    "<div id='#{action}_errors' ></div> "
  end
  
  # if there are errors, display the error and display the message
  # if there are no errors, then show the success and dismiss the dialog
  def ajax_handle_dialog( page, objecttouse, action )
    
    error_div = '';
    if(action.nil?)
      error_div = @controller.action_name+"_errors";
    else
      error_div = action+"_errors";
    end
    if(objecttouse.errors.length > 0)
      if(action != 'create_account' && objecttouse.class.to_s.downcase != 'person')
		  error_text = error_messages_for objecttouse.class.to_s.downcase.to_sym;
		  page.replace_html error_div, flash_helper(flash)+error_text;
		  page.visual_effect :highlight, error_div
	  else
		  page << dojo_dialog_close;
		  page << dojo_announce(objecttouse.class.to_s.downcase+'_'+action);
		  page << dojo_flash(flash_helper(flash));
	  end
    else
      page << dojo_dialog_close;
      page << dojo_announce(objecttouse.class.to_s.downcase+'_'+action);
      page << dojo_flash(flash_helper(flash));
    end
  end
  
    def cdate_select(object_name, method, options = {})
    it = ActionView::Helpers::InstanceTag.new(object_name, method, self, nil, options.delete(:object))
    
    # they don't expose the field naming logic...
    parse_tag = it.to_tag();
    re = /id=\"(.*?)\".*name=\"(.*?)\".*value=\"(.*?)\".*/
    match = re.match(parse_tag)
    
    if( match  )
      value = match[3];
      name = match[2];
      id = match[1]+serialnumber; 
    end
    
<<STR
    <div dojoType='dijit.form.DateTextBox' id='#{id}' name='#{name}' value='#{value}' ></div>
STR
    
  end

  def form_remote_tag(options = {}, &block)
    options[:form] = true
    
    options[:html] ||= {}
    options[:html][:onsubmit] = 
     (options[:html][:onsubmit] ? options[:html][:onsubmit] + "; " : "") + 
           "#{remote_function(options)}; return false;"
    
    form_tag(options[:html].delete(:action) || url_for(options[:url]), options[:html], &block)
  end
  

  
  def dialog_to(name, options = {}, html_options = nil, dialog_title = nil, *parameters_for_method_reference)
    if html_options
      html_options = html_options.stringify_keys
      convert_options_to_javascript!(html_options)
      tag_options = tag_options(html_options)
    else
      tag_options = nil
    end
    id = 'f'+serialnumber;
    
    url = options.is_a?(String) ? options : self.url_for(options, *parameters_for_method_reference);
    
    hname = (name)
    jname = escape_javascript(name)
    url = escape_javascript(url)
    dialog_title = escape_javascript(dialog_title)
    
    
<<STR
      <a href='#' onclick='zstaff.helpers.dialog.show("#{jname}","#{url}","#{dialog_title}");'>#{hname} </a>
STR
  end
    # return a number in serial for every request
  # must conform to javascript naming rules 
  def serialnumber

    @@serial +=1 ;
    
    id = request.object_id.to_i;
    if(id < 0 )
    
      id *= -1;
    end
    
    id %= 103; # mod by prime to keep the digits down.
    
    return("o"+id.to_s+"s"+@@serial.to_s)
    
  end


  @@serial=0

end