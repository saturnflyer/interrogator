# Interrogator

Use this Rails Engine to get information about your classes.

You'll be able to access `/interrogator.json?klass=SomeModel` to get
details about the `klass` that you requested.
It'll return JSON with details about the model's columns and it's 
associated objects.

If you have Searchlogic installed you'll get JSON options for
querying from `/interrogator.js`