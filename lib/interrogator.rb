require 'active_record'

module Interrogator
  def simple_columns_array
    return @a if @a
    @a = []
    columns_hash.each{|k, v|
      @a << {
        :column_name => k,
        :type => v.type,
        :limit => v.limit,
        :null => v.null
      }
    }
    @a
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
