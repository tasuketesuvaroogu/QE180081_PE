import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMovies, deleteMovie, type Movie } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trash2, Edit, Plus, Search, Star } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from './ui/alert-dialog';

export default function HomePage() {
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [genreFilter, setGenreFilter] = useState('All');
	const [ratingFilter, setRatingFilter] = useState<number | undefined>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

	const genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];

	useEffect(() => {
		loadMovies();
	}, [search, genreFilter, ratingFilter]);

	async function loadMovies() {
		try {
			setLoading(true);
			const data = await getMovies(
				search || undefined,
				genreFilter !== 'All' ? genreFilter : undefined,
				ratingFilter
			);
			setMovies(data);
		} catch (error) {
			console.error('Failed to load movies:', error);
		} finally {
			setLoading(false);
		}
	}

	async function handleDelete(movie: Movie) {
		setMovieToDelete(movie);
		setDeleteDialogOpen(true);
	}

	async function confirmDelete() {
		if (!movieToDelete) return;

		try {
			await deleteMovie(movieToDelete.id);
			setMovies(movies.filter((m) => m.id !== movieToDelete.id));
			setDeleteDialogOpen(false);
			setMovieToDelete(null);
		} catch (error) {
			console.error('Failed to delete movie:', error);
			alert('Failed to delete movie');
		}
	}

	const filteredMovies = movies.sort((a, b) => {
		// Sort by rating desc, then by title
		if (a.rating && b.rating) {
			return b.rating - a.rating;
		}
		return a.title.localeCompare(b.title);
	});

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Movie Watchlist</h1>
				<Link to="/movies/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" /> Add Movie
					</Button>
				</Link>
			</div>

			{/* Filters */}
			<div className="mb-6 space-y-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						type="text"
						placeholder="Search movies by title..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-10"
					/>
				</div>

				<div className="flex gap-2 flex-wrap">
					{genres.map((genre) => (
						<Button
							key={genre}
							variant={genreFilter === genre ? 'default' : 'outline'}
							size="sm"
							onClick={() => setGenreFilter(genre)}
						>
							{genre}
						</Button>
					))}
				</div>

				<div className="flex gap-2">
					<span className="text-sm text-gray-600 flex items-center">Filter by rating:</span>
					{[1, 2, 3, 4, 5].map((rating) => (
						<Button
							key={rating}
							variant={ratingFilter === rating ? 'default' : 'outline'}
							size="sm"
							onClick={() => setRatingFilter(ratingFilter === rating ? undefined : rating)}
						>
							{rating} <Star className="ml-1 h-3 w-3 fill-current" />
						</Button>
					))}
					{ratingFilter && (
						<Button variant="ghost" size="sm" onClick={() => setRatingFilter(undefined)}>
							Clear
						</Button>
					)}
				</div>
			</div>

			{/* Movie Grid */}
			{loading ? (
				<div className="text-center py-12">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
					<p className="mt-4 text-gray-600">Loading movies...</p>
				</div>
			) : filteredMovies.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-600">No movies found. Add your first movie!</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredMovies.map((movie) => (
						<Card key={movie.id} className="flex flex-col">
							<CardHeader>
								{movie.posterImage ? (
									<img
										src={movie.posterImage}
										alt={movie.title}
										className="w-full h-48 object-cover rounded-md mb-4"
									/>
								) : (
									<div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
										<span className="text-gray-400">No Image</span>
									</div>
								)}
								<CardTitle className="line-clamp-2">{movie.title}</CardTitle>
							</CardHeader>
							<CardContent className="flex-grow">
								{movie.genre && <Badge variant="secondary">{movie.genre}</Badge>}
								{movie.rating && (
									<div className="flex items-center mt-2">
										{Array.from({ length: 5 }).map((_, i) => (
											<Star
												key={i}
												className={`h-4 w-4 ${
													i < movie.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
												}`}
											/>
										))}
										<span className="ml-2 text-sm text-gray-600">({movie.rating}/5)</span>
									</div>
								)}
							</CardContent>
							<CardFooter className="flex gap-2">
								<Link to={`/movies/${movie.id}/edit`} className="flex-1">
									<Button variant="outline" size="sm" className="w-full">
										<Edit className="mr-2 h-4 w-4" /> Edit
									</Button>
								</Link>
								<Button variant="destructive" size="sm" onClick={() => handleDelete(movie)}>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Movie</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{movieToDelete?.title}"? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
