// Interrogator
// $('#some_form').interrogator({...})

(function($, window, undefined){
  var settings = {}
  var defaults = {
    namespace: 'search',
    klass: 'klass',
    attribute_container: '#attribute_container',
    attribute_selector_input: '#attribute_selector_input',
    attribute_check_boxes_list: '#attribute_check_boxes_list_container ol:first',
    association_container: '#association_container',
    query_fieldset: '#query_fieldset',
    query_container: '#query_container',
    query_type_selector_input: '#query_type_selector_input',
    add_query_input: '#add_query_input',
    sort_container: '#sort_container',
    sort_input: '#sort_input',
    sort_attribute_input: '#sort_attribute_input',
    add_sort_input: '#add_sort_input',
    quick_report_button: '#quick_report_button',
    results_container: '#results_container',
    serialized_string_container: '#serialized_string_container',
    standard_query_path: '/reporter',
    templates: {
      text_input: '#text_input',
      checkbox_input: '#checkbox_input',
      attribute_list: '#attribute_list',
      query_type_selector: '#query_type_selector',
      association_details: '#association_details',
      sort_selector: '#sort_selector',
      results_details: '#results_details',
      attribute_check_boxes: '#attribute_check_boxes'
    },
    regexs: {
      date: /date|_at|_on|dob/i,
      checkbox: /(^ascend|^descend)|((empty|null|blank)$)/i,
      skip_queries: /_a(ny|ll)$/i
    },
    callbacks: {
      report: function(){},
      form_change: function(){}
    }
  }

  var $interrogator
  
  var callreport = []

  var callstack = [
    'setup',
    'load_query_options',
    'setup_add_query_input',
    'setup_query_input_remover',
    'setup_add_sort_input',
    'setup_query_limit',
    'store_params',
    'load_templates',
    'set_klass',
    'setup_klass_selector',
    'load_klass_details',
    'setup_quick_report_button',
    'setup_select_checkboxes'
  ]

  var methods = {
    setup: function(options){
      $interrogator = $(this)
      $interrogator.data('interrogator',{'callstack': callstack, 'settings':settings, 'callreport': callreport})
      $interrogator.data('interrogator')['callreport'].push('setup')
      return $interrogator
    },
    store_params: function(options){
      $interrogator.data('interrogator')['params'] = methods['build_params'].call(this, options)
      $interrogator.data('interrogator')['callreport'].push('store_params')
      return $interrogator.data('interrogator')['params']
    },
    build_params: function(options){
      $interrogator.data('interrogator')['callreport'].push('build_params')
      var param_string = methods['get_params'].call(this, options) || undefined
      var a
      if(param_string){a = param_string.split('&')}else{a = []}
      var o = {}
      for(var i in a){
        var pair = a[i].split('=')
        var param = unescape(pair[0])
        if(pair[0] != 'commit'){
          if(o[param]){
            if($.isArray(o[param])){
              o[param].push(pair[1])
            } else {
              var old_value = o[param]
              o[param] = [old_value]
              o[param].push(pair[1])
              old_value = undefined
            }
          } else {
            o[param] = pair[1]
          }
        }
      }
      return o
    },
    get_params: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('get_params')
      var serialized_data = ''
      if($form.data('interrogator')['built']){
        if($form.get(0).tagName.toLowerCase() == 'form'){
          serialized_data = $form.serialize()
        } else {
          serialized_data = $form.text()
        }
      } else {
        var $serialized_string_container = $(settings.serialized_string_container)
        if($form.get(0).tagName.toLowerCase() == 'form'){
          serialized_data = window.location.href.split('?')[1]
        } else {
          serialized_data = $form.text()
        }
      }
      return serialized_data
    },
    load_templates: function(options){
      $(this).data('interrogator')['callreport'].push('load_templates')
      $.each(settings.templates,function(i,item){
        $(item).template(template_name(item))
      })
      return this
    },
    load_query_options: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('load_query_options')
      $form.data('interrogator')['query_options'] = {}
      $.getJSON('/interrogator.js',function(data){
        $form.data('interrogator')['query_options'] = data

        var typical = []
        for(var i in data['PRIMARY_CONDITIONS'].sort()){
          var query = data['PRIMARY_CONDITIONS'][i]
          if(!settings.regexs.skip_queries.test(query))
            typical.push({'condition':data['PRIMARY_CONDITIONS'][i]})
        }
        var standard = {'options':typical}
        $form.data('interrogator')['query_options']['standard'] = standard
      })
    },
    set_klass: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('set_klass')
      var klass_input_name = settings.namespace + '['+settings.klass+']'
      var selected_klass = $form.data('interrogator')['params'][klass_input_name]
      // BUG: had to go with #ID selector to get this to work. Should be configurable
      $form.data('interrogator')['klass_selector'] = $('#'+settings.namespace + '_' + settings.klass)
      $form.data('interrogator')['klass_selector'].val(selected_klass)
    },
    load_klass_details: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('load_klass_details')
      var selected_klass = $form.data('interrogator')['klass_selector'].val()
      if(selected_klass == undefined){
        selected_klass = $form.data('interrogator')['params'][settings.namespace + '['+settings.klass+']']
      }
      $form.data('interrogator')['selected_klass'] = selected_klass
      if(selected_klass != undefined && selected_klass != ''){
        $form.data('interrogator')['selected_klass'] = selected_klass
        $.getJSON('/interrogator.json',{'klass': selected_klass},function(data){
          if(!$form.data('interrogator')['classes']){
            $form.data('interrogator')['classes'] = {}
          }
          $form.data('interrogator')['classes'][selected_klass] = data
          methods['build_association_details'].call($form,options)
          methods['build_selectable'].call($form,options)
          methods['build_attribute_selector'].call($form,options)
          methods['build_sort_selector'].call($form,options)
          methods['build_form'].call($form,options)
        })
      }
    },
    build_association_details: function(options){
      var $association_container = $(settings.association_container)
      var t_name = template_name(settings.templates.association_details)
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('build_association_details')
      var current_class = $form.data('interrogator')['selected_klass']
      var class_details = $form.data('interrogator')['classes'][current_class]
      $association_container.html($.tmpl(t_name,class_details))
    },
    build_selectable: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('build_selectable')
      var $list = $(settings.attribute_check_boxes_list)
      var t_name = template_name(settings.templates.attribute_check_boxes)
      var current_class = $form.data('interrogator')['selected_klass']
      var current_class_details = $form.data('interrogator')['classes'][current_class]
      if($list.size() > 0){
        $list.replaceWith($.tmpl(t_name, current_class_details))
        methods['make_selected'].call(this,options)
      }
    },
    make_selected: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('make_selected')
      // ASSUMPTION: the name of the selected fields uses "select"
      var selected = $form.data('interrogator')['params'][settings.namespace+'[select][]']
      if(selected != null){
        $.each(selected,function(i,item){
         $(settings.attribute_check_boxes_list).find(':checkbox[value='+item+']').attr('checked',true)
        })
      }
    },
    build_form: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('build_form')
      var $fieldset = $(settings.query_fieldset)
      var params = $(this).data('interrogator')['params']
      // ASSUMPTION: the name of the selected fields uses "select"
      var select_checkbox_name = settings.namespace + '\\[select\\]\\[\\]'
      var klass_selector_name = settings.namespace + '\\['+settings.klass+'\\]'
      if($fieldset.size() > 0){
        var $list = $fieldset.find('ol')
        for(var i in params){
          if(!RegExp(select_checkbox_name).test(i) && !RegExp(klass_selector_name).test(i)){
            var column_query = i.replace(RegExp('('+settings.namespace+'\\[|\\])','ig'),'')
            var label_text = column_query.replace(/_/g,' ')
            // debugger
            var build_options = {
              'column_query':column_query,
              'label_text':label_text,
              'type': (settings.regexs.date.test(column_query) ? 'date' : 'text'),
            }
            if(settings.regexs.checkbox.test(column_query)){
              build_options['value'] = true
              $list.append($.tmpl('checkbox_input_template',[build_options]))
            } else {
              build_options['value'] = decodeURIComponent(params[i].replace(/\+/g,' '))
              $list.append($.tmpl('text_input_template',[build_options]))
            }
          }
        }
      }
      if(!$(this).data('interrogator')['built']){
        methods['report'].call(this,options)
      }
      settings.callbacks['form_change'].call(this)
      $interrogator.data('interrogator')['built'] = true
    },
    build_attribute_selector: function(options){
      var $form = $(this)
      $form.data('interrogator')['callreport'].push('build_attribute_selector')
      var data = $form.data('interrogator')['classes'][$form.data('interrogator')['selected_klass']]
      var $attr_container = $(settings.attribute_container)
      var t_name = template_name(settings.templates.attribute_list)
      $attr_container.html($.tmpl(t_name,data))

      var t_query_name = template_name(settings.templates.query_type_selector)
      var $query_container = $(settings.query_container)
      var standard_queries = $form.data('interrogator')['query_options']['standard']
      if($query_container.size() < 1){
        $attr_container.append($.tmpl(t_query_name, standard_queries))
      } else {
        $query_container.replaceWith($.tmpl(t_query_name, standard_queries))
      }
      $attr_container.find('a').button()

    },
    setup_add_query_input: function(options){
      $interrogator.data('interrogator')['callreport'].push('setup_add_query_input')
      $(settings.add_query_input).live('click',function(e){
        var attribute_name = $(settings.attribute_selector_input).val(),
            query_name = $(settings.query_type_selector_input).val(),
            type = ''
        if(settings.regexs.date.test(attribute_name))
            type = 'date'

        if(!attribute_name.match(/\w/i)){
          return false
        }
        var query_input_name = combine_input_options([attribute_name, query_name])
        var template_data = [{"column_query":query_input_name, "label_text":query_input_name.replace(/_/g,' '), "type":type}]
        var t_name
        var $fieldset = $(settings.query_fieldset)
        var $list = $fieldset.find('ol:first')
        if(query_name.match(settings.regexs.checkbox)){
          t_name = template_name(settings.templates.checkbox_input)
          $list.append($.tmpl(t_name,template_data))
        } else {
          t_name = template_name(settings.templates.text_input)
          $list.append($.tmpl(t_name,template_data))
        }
        settings.callbacks['form_change'].call($interrogator)
        $list.find('input:last').focus()
        e.preventDefault()
      })
    },
    setup_query_input_remover: function(options){
      $interrogator.data('interrogator')['callreport'].push('setup_query_input_remover')
      $interrogator.delegate('a.remover','click',function(e){
        $(this).parents('li').remove()
        settings.callbacks['form_change'].call($interrogator)
        e.preventDefault();
      })
    },
    setup_klass_selector: function(options){
      var $form = $(this)
      $interrogator.data('interrogator')['callreport'].push('setup_klass_selector')
      $(this).data('interrogator')['klass_selector'].change(function(e){
        methods['clear'].call($form,options)
        // ASSUMPTION: the name of the selected fields uses "select"
        $form.data('interrogator')['params'][settings.namespace+'[select][]'] = null
        methods['store_params'].call($form,options)
        methods['load_klass_details'].call($form,options)
        settings.callbacks['form_change'].call($interrogator)
      })
    },
    clear: function(options){
      $interrogator.data('interrogator')['callreport'].push('clear')
      $(this).find('#'+settings.namespace+'_'+settings.klass+'_input').siblings().remove()
      $(settings.attribute_check_boxes_list).find(':checkbox').attr('checked',null)
    },
    build_sort_selector: function(options){
      $interrogator.data('interrogator')['callreport'].push('build_sort_selector')
      var $form = $(this)
      var $sort_container = $(settings.sort_container)
      var $sort_input = $(settings.sort_input)
      var t_name = template_name(settings.templates.sort_selector)
      var data = $form.data('interrogator')['classes'][$form.data('interrogator')['selected_klass']]
      $sort_container.html($.tmpl(t_name,data))
      $("#add_sort_input").button()
    },
    setup_add_sort_input: function(options){
      $interrogator.data('interrogator')['callreport'].push('setup_add_sort_input')
      $(settings.add_sort_input).live('click', function(e){
        var sort_type = $(settings.sort_input).val(),
            attribute_name = $(settings.sort_attribute_input).val()

        if(!attribute_name.match(/\w/i) || !sort_type.match(/\w/i)){
          return false
        }
        var query_input_name = combine_input_options([sort_type,attribute_name])
        var template_data = [{"column_query":query_input_name, "label_text":query_input_name.replace(/_/g,' ')}]
        var t_name = template_name(settings.templates.checkbox_input)
        var $fieldset = $(settings.query_fieldset)
        var $list = $fieldset.find('ol:first')
        $list.append($.tmpl(t_name,template_data))
        settings.callbacks['form_change'].call($interrogator)
        e.preventDefault()
      })
    },
    setup_query_limit: function(options){
      $interrogator.data('interrogator')['callreport'].push('setup_query_limit')
      $(settings.attribute_selector_input).live('change',function(e){
        var $selector = $(this)
        var $query_type_selector_input = $(settings.query_type_selector_input)
        $query_type_selector_input.children('option').attr('disabled',null)
        var $selected_value = $selector.val()
        if(settings.regexs.date.test($selected_value)){
          $query_type_selector_input.find('option[value$=with]').add('option[value$=like]').attr('disabled',true)
        }
      })
    },
    setup_quick_report_button: function(options){
      $interrogator.data('interrogator')['callreport'].push('setup_quick_report_button')
      var $form = $(this)
      $form.delegate(settings.quick_report_button,'click',function(e){
        methods['report'].call($form,options)
        return false
      })
    },
    setup_select_checkboxes: function(options){
      $interrogator.data('interrogator')['callreport'].push('setup_select_checkboxes')
      $(settings.attribute_check_boxes_list + ' :checkbox').live('click',function(){
        settings.callbacks['form_change'].call($interrogator)
      })
    },
    report: function(options){
      $interrogator.data('interrogator')['callreport'].push('report')
      var $form = $(this)
      if($form.data('interrogator')['klass_selector'].size() > 0 && !$form.data('interrogator')['klass_selector'].val()){
        return false
      }
      var formresponse = {"results":[]}
      var t_name = template_name(settings.templates.results_details)
      var query_string = $form.serialize()
      if($form.get(0).nodeName.toLowerCase() != 'form'){
        query_string = $form.text()
      }
      var action = $form.attr('action')
      if(!action){
        action = settings.standard_query_path
      }
      $.getJSON(action + '.json?' + query_string, function(data){
        var reported_klass = $form.data('interrogator')['selected_klass']
        $form.data('interrogator').reported_klass = reported_klass
        formresponse["results"] = data
        if(data.length){
          $(settings.results_container).empty().append($.tmpl(t_name,formresponse))
        }else{
          $(settings.results_container).html('<h2>Results</h2><p>No results found.</p>')
        }
        if(settings.callbacks['report']){
          settings.callbacks['report'].call($form)
        }
      })
      return this
    }
  }

  var query_string_found = function(){
    return (window.location.href.split('?').length > 1 || $(settings.serialized_string_container).size() > 0)
  }

  var combine_input_options = function(a){
    return a.join('_').replace(/_+/g,'_').replace(/^_?/,'')
  }
  var template_name = function(selector){
    return selector.replace(/[# >\.~]/,'') + '_template'
  }

  $.fn.interrogator = function(method){
    if(this.size() > 0){
      if ( methods[method] ) {
        $.extend(true, settings, defaults)
        return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if( typeof(method) === 'object' || ! method ) {
        settings = $.extend(true, defaults, method)
        var returned
        var selected = this
        $.each(callstack, function(i,item){
          returned = methods[item].apply(selected,arguments)
        })
        return returned
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.interrogator' );
      }
    }
  }

})(jQuery, window)