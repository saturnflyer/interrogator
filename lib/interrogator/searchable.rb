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
            unless file.match(/test|spec/)
              class_name = file.sub(load_path + File::SEPARATOR,'').sub(/\.rb$/,'').camelize
              klass = class_name.split('::').inject(Object){ |klass,part| klass.const_get(part) } rescue nil
            end
          }
        end
      end
    end
  end
end