from docutils.core import publish_string
from docutils.writers.html5_polyglot import Writer, HTMLTranslator
import os

script_dir = os.path.dirname(os.path.realpath(__file__))

with open(os.path.join(script_dir, './playground.rst'), 'r') as file:
    rst = file.read()

writer = Writer()
writer.translater_class = HTMLTranslator

html_str = publish_string(rst, writer = writer).decode('utf-8')
print(html_str)

parse_tree_str = publish_string(rst).decode('utf-8')
print(parse_tree_str)
