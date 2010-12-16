module Interrogator
  class Conditions
    if defined?(Searchlogic)
      Searchlogic::NamedScopes::Conditions.constants.each do |konstant|
        konst_sym = konstant.intern
        konst_val = Searchlogic::NamedScopes::Conditions.const_get(konst_sym)
        const_set(konst_sym, konst_val)
      end
    end
  end
end