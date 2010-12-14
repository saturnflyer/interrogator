# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "interrogator/version"

Gem::Specification.new do |s|
  s.name        = "interrogator"
  s.version     = Interrogator::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Jim Gay"]
  s.email       = ["jim@saturnflyer.com"]
  s.homepage    = ""
  s.summary     = %q{Interrogate an ActiveRecord class to get details about attributes and associations.}
  s.description = %q{Ask an ActiveRecord class for details about the database columns and details about the defined associations.}

  s.rubyforge_project = "interrogator"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
