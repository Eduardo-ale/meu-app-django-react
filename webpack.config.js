const path = require('path');

module.exports = {
  entry: {
    // Entry points para todos os componentes React
    'react-services': './static/js/entries/react-services.js',
    'lista-telefonica': './static/js/entries/lista-telefonica.js',
    'configuracoes': './static/js/entries/configuracoes.js',
    'criar-unidade': './static/js/entries/criar-unidade.js',
    'criar-usuario': './static/js/entries/criar-usuario.js',
    'editar-usuario': './static/js/entries/editar-usuario.js',
    'editar-unidade': './static/js/entries/editar-unidade.js',
    'historico': './static/js/entries/historico.js',
    'home': './static/js/entries/home.js',
    'home-simple': './static/js/entries/home-simple.js',
    'notificacoes': './static/js/entries/notificacoes.js',
    'perfil': './static/js/entries/perfil.js',
    'perfil-debug': './static/js/entries/perfil-debug.js',
    'perfil-moderno': './static/js/entries/perfil-moderno.js',
    'registro-chamada': './static/js/entries/registro-chamada.js',
    'relatorios': './static/js/entries/relatorios.js',
    'senha': './static/js/entries/senha.js',
    'unidades-saude': './static/js/entries/unidades-saude.js',
    'visualizar-unidade': './static/js/entries/visualizar-unidade.js'
  },
  output: {
    path: path.resolve(__dirname, 'static/js/dist'),
    filename: '[name].bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  mode: 'development',
  devtool: 'source-map',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}; 