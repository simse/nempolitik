import CMS from "netlify-cms-app"
import idWidget from 'netlify-cms-widget-simple-uuid';

CMS.registerWidget('id', idWidget.Control, idWidget.Preview);