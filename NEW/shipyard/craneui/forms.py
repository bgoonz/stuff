from django import forms
from containers.models import Host
from containers.forms import get_available_hosts, get_image_choices
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, ButtonHolder, Submit, Field, Div
from crispy_forms.bootstrap import FieldWithButtons, StrictButton
from django.core.urlresolvers import reverse
from django.utils.translation import ugettext as _

from crane.inspect import list_oses, list_interpreters, list_third_party_softwares, list_versions, interpreter_extension

oses = list_oses()
interpreters = list_interpreters()
third_party = list_third_party_softwares()
interpreter_name = interpreters[0][1]
extension = interpreter_extension(interpreter_name)
versions = list_versions(interpreter_name)

def get_application_images():
    raw_images = get_image_choices()
    images = []
    for image in raw_images:
        if image[1].count('/') == 4:
           images.append(image)
    return images

# FIXME : put in view, do ajax for this
def get_existing_database():
    # FIXME : list the dir on remote host
    return []

class CreateContainerForm(forms.Form):
      application = forms.ChoiceField()

      command = forms.CharField(required=False, help_text=\
	'Override the command binded to the image.')
      description = forms.CharField(required=False)
      hosts = forms.MultipleChoiceField()

      def __init__(self, *args, **kwargs):
         super(CreateContainerForm, self).__init__(*args, **kwargs)
         self.helper = FormHelper()
         self.helper.form_id = 'form-create-container'
         self.helper.form_class = 'form-horizontal'
         self.helper.form_action = reverse('craneui.views.create_container')
         self.helper.help_text_inline = True
         self.fields['application'].choices = [('', '----------')] + \
             [x for x in get_application_images()]
         self.fields['hosts'].choices = \
             [(x.id, x.name) for x in get_available_hosts()]

class OsBuildForm(forms.Form):
      os = forms.ChoiceField(choices=oses)
      hosts = forms.MultipleChoiceField()

      def __init__(self, *args, **kwargs):
          super(OsBuildForm, self).__init__(*args, **kwargs)
          self.helper = FormHelper()
          self.helper.form_id = 'form-build-os'
          self.helper.form_class = 'form-horizontal' # FIXME : horizontal?
          self.helper.form_action = reverse('craneui.views.build_os')
          self.helper.help_text_inline = True
          self.fields['hosts'].choices = \
            [(x.id, x.name) for x in get_available_hosts()]

class InterpreterBuildForm(forms.Form):
      os = forms.ChoiceField(choices=oses)
      interpreter = forms.ChoiceField(choices=interpreters)
      version = forms.ChoiceField(choices=versions)
      hosts = forms.MultipleChoiceField()

      def __init__(self, *args, **kwargs):
          super(InterpreterBuildForm, self).__init__(*args, **kwargs)
          self.helper = FormHelper()
          self.helper.form_id = 'form-build-interpreter'
          self.helper.form_class = 'form-horizontal' # FIXME : horizontal?
          self.helper.form_action = reverse('craneui.views.build_interpreter')
          self.helper.help_text_inline = True
          self.fields['hosts'].choices = \
            [(x.id, x.name) for x in get_available_hosts()]

          # FIXME : inline interpreter/version
          self.helper.layout = Layout(
               'os',
               Field('interpreter', css_class="input-small", id="interpreter_interpreter"),
               Field('version', css_class="input-small", id="interpreter_version", label=""),
               'hosts')

class ApplicationBuildForm(forms.Form):
      os = forms.ChoiceField(choices=oses)
      interpreter = forms.ChoiceField(choices=interpreters)
      version = forms.ChoiceField(choices=versions, label=None)
      application = forms.FileField('application')
      git_url = forms.CharField(help_text=' ')
      database_name = forms.CharField(help_text=' ')
      port = forms.CharField(initial=5000)
      launch = forms.CharField(initial="%s app.%s" % (interpreter_name, extension))
      after_launch = forms.CharField(initial="siege --concurrent 2 --delay 1 -f urls.txt", required = False)
      before_launch = forms.CharField(initial="%s db.%s" % (interpreter_name, extension), required=False)
      hosts = forms.MultipleChoiceField()

      def __init__(self, *args, **kwargs):
          super(ApplicationBuildForm, self).__init__(*args, **kwargs)
          self.helper = FormHelper()
          self.helper.form_id = 'form-build-application'
          self.helper.form_class = 'form-horizontal' # FIXME : horizontal?
          self.helper.form_action = reverse('craneui.views.build_application')
          self.helper.help_text_inline = True
          self.fields['hosts'].choices = \
            [(x.id, x.name) for x in get_available_hosts()]

          # FIXME : inline interpreter/version
          self.helper.layout = Layout(
               'os',
#               Div(
#                    Div(Field('interpreter', css_class="span12", id="application_interpreter"), css_class="span6"),
#                    Div(Field('version', css_class="span12", id="application_version", label=""), css_class="span6")
#               ,css_class="row-fluid"),
               Field('interpreter',id="application_interpreter"),
               Field('version', id="application_version", label=""),
               'application',
               'git_url',
               'port',
               'database_name',
               'before_launch',
               'launch',
               'after_launch',
               'hosts'
               )

class ThirdPartyBuildForm(forms.Form):
      os = forms.ChoiceField(choices=oses)
      software = forms.ChoiceField(choices=list_third_party_softwares())
      # FIXME : add a password field?
      hosts = forms.MultipleChoiceField()

      def __init__(self, *args, **kwargs):
          super(ThirdPartyBuildForm, self).__init__(*args, **kwargs)
          self.helper = FormHelper()
          self.helper.form_id = 'form-build-third'
          self.helper.form_class = 'form-horizontal' # FIXME : horizontal?
          self.helper.form_action = reverse('craneui.views.build_third')
          self.helper.help_text_inline = True
          self.fields['hosts'].choices = \
            [(x.id, x.name) for x in get_available_hosts()]
