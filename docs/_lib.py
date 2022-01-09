import html
import re
import textwrap
from _data import DECODERS, LOCATIONS


def safe(s):
  return html.escape(s)


def linkify_decoder(s):
  return re.sub('Decoder', '<a href="/Decoder.html" style="color: inherit">Decoder</a>', s)


def format_type(s):
  return f'<i style="color: #267f99">{linkify_decoder(safe(s))}</i>'


def reindent(s, prefix = ''):
  return textwrap.indent(textwrap.dedent(s), prefix).strip()


def ref(name):
  decoder = DECODERS.get(name)
  if decoder is not None:
    if decoder.get('params') is not None:
      return f'[`{name}()`](#{name})'
  return f'[`{name}`](/api.html#{name})'


def methodref(name):
  return f'[`.{name}()`](/Decoder.html#{name})'


def source_link(name):
  source = LOCATIONS.get(name)
  return f"[<small>(source)</small>]({source} 'Source')" if source else ''


def slugify(s):
  return re.sub('[^a-z0-9]+', '-', s.lower())
