import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import GavelIcon from '@mui/icons-material/Gavel';
import { useAuth } from '../../contexts/AuthContext';

// Search result type
interface SearchResult {
  id: string;
  title: string;
  court: string;
  judge: string;
  date: Date;
  summary: string;
  fullText: string;
  relevance: number;
  bookmarked: boolean;
  type: 'decision' | 'precedent' | 'summary';
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [expandedFilters, setExpandedFilters] = useState<boolean>(false);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  
  // Filters
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const courts = ['STF', 'STJ', 'TST', 'TRF', 'TJSP', 'TJRJ', 'TJMG'];
  const years = ['2023', '2022', '2021', '2020', '2019', '2018'];
  const resultTypes = ['decision', 'precedent', 'summary'];
  
  const resultsPerPage = 10;

  // Mock search function
  const performSearch = () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearchParams({ q: searchTerm });
    
    // Simulate API delay
    setTimeout(() => {
      // Generate mock results
      const mockResults: SearchResult[] = Array(25).fill(null).map((_, index) => {
        const id = `result-${index + 1}`;
        const courts = ['STF', 'STJ', 'TST', 'TRF-1', 'TJSP', 'TJRJ', 'TJMG'];
        const courtIndex = Math.floor(Math.random() * courts.length);
        const types: ('decision' | 'precedent' | 'summary')[] = ['decision', 'precedent', 'summary'];
        const typeIndex = Math.floor(Math.random() * types.length);
        const randomYear = 2018 + Math.floor(Math.random() * 6);
        const randomMonth = 1 + Math.floor(Math.random() * 12);
        const randomDay = 1 + Math.floor(Math.random() * 28);
        
        return {
          id,
          title: `${courts[courtIndex]} - Processo nº ${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 100)}.${randomYear}`,
          court: courts[courtIndex],
          judge: ['Maria Silva', 'João Santos', 'Ana Oliveira', 'Carlos Eduardo'][Math.floor(Math.random() * 4)],
          date: new Date(randomYear, randomMonth, randomDay),
          summary: `Ementa: ${searchTerm} - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.`,
          fullText: `ACÓRDÃO
          
Vistos, relatados e discutidos estes autos, acordam os Ministros do ${courts[courtIndex]}, em conformidade com os votos e as notas taquigráficas a seguir, por unanimidade, ${Math.random() > 0.5 ? 'dar provimento' : 'negar provimento'} ao recurso, nos termos do voto do Relator. 

RELATÓRIO

Trata-se de recurso interposto por NOME DA PARTE contra acórdão do Tribunal de Justiça que ${searchTerm}. Alega o recorrente, em síntese, que a decisão merece reforma porque violou dispositivos da Constituição Federal e da legislação infraconstitucional.

VOTO

Como se observa, a questão central diz respeito a ${searchTerm}. A jurisprudência desta Corte é pacífica no sentido de que ${Math.random() > 0.5 ? 'é cabível' : 'não é cabível'} a pretensão do recorrente. 

Pelo exposto, ${Math.random() > 0.5 ? 'dou provimento' : 'nego provimento'} ao recurso.

É como voto.`,
          relevance: 90 - index * 3,
          bookmarked: index < 2,
          type: types[typeIndex]
        };
      });
      
      setResults(mockResults);
      setTotalPages(Math.ceil(mockResults.length / resultsPerPage));
      setLoading(false);
    }, 1500);
  };

  // Perform search when page loads with query parameter
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch();
    }
  }, []);

  const toggleBookmark = (id: string) => {
    setResults(prevResults => 
      prevResults.map(result => 
        result.id === id 
          ? {...result, bookmarked: !result.bookmarked} 
          : result
      )
    );
  };

  const handleExpandResult = (id: string) => {
    setExpandedResultId(expandedResultId === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Texto copiado para a área de transferência!");
      },
      (err) => {
        console.error('Erro ao copiar texto: ', err);
      }
    );
  };

  // Apply filters to results
  const filteredResults = results.filter(result => {
    if (courtFilter !== 'all' && !result.court.includes(courtFilter)) return false;
    if (yearFilter !== 'all' && result.date.getFullYear().toString() !== yearFilter) return false;
    if (typeFilter !== 'all' && result.type !== typeFilter) return false;
    return true;
  });

  // Paginate results
  const paginatedResults = filteredResults.slice(
    (page - 1) * resultsPerPage, 
    page * resultsPerPage
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 2, pb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pesquisa Jurisprudencial
        </Typography>
        
        {/* Search Box */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Digite sua pesquisa jurisprudencial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SearchIcon />}
                      onClick={performSearch}
                      disabled={loading || !searchTerm.trim()}
                    >
                      Pesquisar
                    </Button>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    performSearch();
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Dica: Use aspas para buscar termos exatos. Ex: "dano moral"
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Filters */}
        <Accordion 
          expanded={expandedFilters} 
          onChange={() => setExpandedFilters(!expandedFilters)}
          sx={{ mb: 3 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography>Filtros de pesquisa</Typography>
              {(courtFilter !== 'all' || yearFilter !== 'all' || typeFilter !== 'all') && (
                <Chip 
                  label="Filtros ativos" 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="court-filter-label">Tribunal</InputLabel>
                  <Select
                    labelId="court-filter-label"
                    value={courtFilter}
                    label="Tribunal"
                    onChange={(e) => setCourtFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos os tribunais</MenuItem>
                    {courts.map(court => (
                      <MenuItem key={court} value={court}>{court}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="year-filter-label">Ano</InputLabel>
                  <Select
                    labelId="year-filter-label"
                    value={yearFilter}
                    label="Ano"
                    onChange={(e) => setYearFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos os anos</MenuItem>
                    {years.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="type-filter-label">Tipo</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    value={typeFilter}
                    label="Tipo"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">Todos os tipos</MenuItem>
                    <MenuItem value="decision">Decisão</MenuItem>
                    <MenuItem value="precedent">Precedente</MenuItem>
                    <MenuItem value="summary">Súmula</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        
        {/* Results */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : paginatedResults.length > 0 ? (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredResults.length} resultados encontrados para "{searchParams.get('q')}"
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              {paginatedResults.map(result => (
                <Card key={result.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" component="h2">
                            {result.title}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleBookmark(result.id)}
                            color={result.bookmarked ? 'primary' : 'default'}
                            sx={{ ml: 1 }}
                          >
                            {result.bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip 
                            icon={<GavelIcon fontSize="small" />}
                            label={result.court} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={result.date.toLocaleDateString('pt-BR')} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={
                              result.type === 'decision' ? 'Decisão' : 
                              result.type === 'precedent' ? 'Precedente' : 'Súmula'
                            }
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`Relevância: ${result.relevance}%`}
                            size="small" 
                            color={
                              result.relevance > 80 ? 'success' : 
                              result.relevance > 50 ? 'warning' : 'error'
                            }
                            variant="outlined" 
                          />
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          {result.summary}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button 
                        variant="text" 
                        onClick={() => handleExpandResult(result.id)}
                        endIcon={<ExpandMoreIcon />}
                      >
                        {expandedResultId === result.id ? 'Ocultar texto completo' : 'Ver texto completo'}
                      </Button>
                      
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(result.summary)}
                          title="Copiar ementa"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          title="Baixar PDF"
                          sx={{ ml: 1 }}
                        >
                          <FileDownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {expandedResultId === result.id && (
                      <Box sx={{ mt: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography 
                          variant="body2" 
                          component="pre"
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            bgcolor: 'grey.100',
                            p: 2,
                            borderRadius: 1
                          }}
                        >
                          {result.fullText}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            startIcon={<ContentCopyIcon />}
                            onClick={() => copyToClipboard(result.fullText)}
                            size="small"
                          >
                            Copiar texto completo
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={(_, newPage) => setPage(newPage)} 
                    color="primary" 
                  />
                </Box>
              )}
            </Box>
          </>
        ) : searchParams.get('q') ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">
              Nenhum resultado encontrado para "{searchParams.get('q')}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tente outros termos ou remova os filtros aplicados.
            </Typography>
          </Paper>
        ) : null}
      </Box>
    </Container>
  );
};

export default SearchPage; 