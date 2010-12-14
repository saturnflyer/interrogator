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
    result = {
      :has_many => [],
      :has_one => []
      :belongs_to => []
    }
    reflect_on_all_associations(:has_many).each do |reflection|
      result[:has_many] << {:name => reflection.name, :options => reflection.options}
  end
  reflect_on_all_associations(:has_one).each do |reflection|
    result[:has_one] << {:name => reflection.name, :options => reflection.options}
  end
  reflect_on_all_associations(:belongs_to).each do |reflection|
    result[:has_many] << {:name => reflection.name, :options => reflection.options}
  end
  result
end
