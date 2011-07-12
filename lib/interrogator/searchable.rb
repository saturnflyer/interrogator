module Interrogator
  class Searchable
    class_inheritable_accessor :excluded_models
    self.excluded_models ||= []
  
    class << self
      def models(opts={})
        excluded = excluded_models
        if opts[:exclude]
          excluded << opts[:exclude]
          excluded.uniq!
        end
        load_models
        (Object.subclasses_of(ActiveRecord::Base).delete_if{ |klass|
          excluded.any?{ |e| 
            e.to_s == klass.to_s 
          }
        }).sort_by{|klass| klass.name}
      end
      
      def load_models
        Rails.configuration.load_paths.map{|p| p.sub(/\/$/,'')}.uniq.delete_if{|p| !p.match(/models/)}.each do |load_path|
          Dir.glob(File.join(load_path, '**', '*.rb')).each { |file|
            unless file.match(/(test|spec)$/)
              short_file_name = file.split("models#{File::SEPARATOR}").last
              class_name = short_file_name.sub(/\.rb$/,'').camelize
              klass = class_name.split('::').inject(Object){ |klass,part| klass.const_get(part) } rescue nil
            end
          }
        end
      end

      def sql_select(klass, selection_param, distinct=true)
        klass_table_name = klass.quoted_table_name
        selected_columns = selection_param.delete_if{|p| p.blank? }
        quoted_columns = []
        selected_columns.each do |column|
          table_name = nil
          select_pair = column.split('.')
          case select_pair.size
            when 1
              #current class
              table_name = klass_table_name
            when 2
              # related
              if select_pair.first != klass.table_name && reflection = klass.reflect_on_association(select_pair.first.to_sym)
                table_name = (reflection.options[:class_name] || reflection.name.to_s.classify).constantize.quoted_table_name
              else
                table_name = klass_table_name
              end
            else
              # 0 or more than 2... something should be done here
          end
          column_name = ActiveRecord::Base.connection.quote_column_name(select_pair.last)
          quoted_columns << "#{table_name}.#{column_name}"
        end
        select_string = distinct ? 'DISTINCT ' : ''
        select_string << quoted_columns.join(', ')
      end
    end
  end
end