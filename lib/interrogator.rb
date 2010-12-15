require 'active_record'

module Interrogator
  def simple_columns_hash
    return @h if @h
    @h = {}
    columns_hash.each{|k, v|
      @h[k] = {:type => v.type,
        :limit => v.limit,
        :null => v.null
      }
    }
    @h
  end
  def associated_models_hash
     {}.tap do |hash|
      [:has_many, :has_one, :belongs_to].each do |assoc|
        hash[assoc] = []
        reflect_on_all_associations(assoc).each do |reflection|
          hash[assoc] << {:name => reflection.name, :options => reflection.options.tap{|o| o.delete(:extend)}}
        end
      end
    end
  end
end

ActiveRecord::Base.send(:extend, Interrogator)
